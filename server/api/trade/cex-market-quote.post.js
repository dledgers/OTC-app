import {
	serverSupabaseClient,
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";
import Joi from "joi";

const AVAILABLE_PAIRS = [
	"BTC-USDC",
	"USDC-EUR",
	"ETH-USDC",
	"ETH-BTC",
	"BTC-EUR",
];

const schema = Joi.object({
	side: Joi.string().valid("BUY", "SELL").required().messages({
		"any.only": "Invalid trade side. Allowed values: buy, sell",
		"any.required": "Trade side is required",
	}),
	currency: Joi.string()
		.valid("BTC", "EUR", "USDC", "ETH")
		.required()
		.messages({
			"any.only": "Invalid buy symbol. Allowed symbols: BTC, EUR, USDC",
			"any.required": "Buy symbol is required",
		}),
	counterCurrency: Joi.string()
		.valid("BTC", "EUR", "USDC", "ETH")
		.required()
		.messages({
			"any.only": "Invalid sell symbol. Allowed symbols: BTC, EUR, USDC",
			"any.required": "Sell symbol is required",
		}),
	amount: Joi.number().positive().required().messages({
		"number.positive": "Buy amount must be greater than 0",
		"any.required": "Buy amount is required",
	}),
});

export default eventHandler(async (event) => {
	const client = await serverSupabaseClient(event);
	const user = await serverSupabaseUser(event);
	const body = await readBody(event);

	const { error, value } = schema.validate(body, { abortEarly: false });
	if (error) {
		throw createError({
			statusCode: 400,
			statusMessage: JSON.stringify(error),
		});
	}

	try {
		// Determine the correct trading pair format
		const directPair = `${body.currency}-${body.counterCurrency}`;
		const reversePair = `${body.counterCurrency}-${body.currency}`;

		let tradingPair = null;
		let isReversed = false;

		if (AVAILABLE_PAIRS.includes(directPair)) {
			tradingPair = directPair;
		} else if (AVAILABLE_PAIRS.includes(reversePair)) {
			tradingPair = reversePair;
			isReversed = true;
		}

		if (!tradingPair) {
			throw createError({
				statusCode: 400,
				statusMessage: `Invalid trading pair. Available pairs are: ${AVAILABLE_PAIRS.join(", ")}`,
			});
		}

		// Get trading conditions for the pair
		const conditions = await getTradeConditions([tradingPair]);

		if (!conditions.data || !conditions.data[tradingPair]) {
			throw createError({
				statusCode: 400,
				statusMessage: "Trading conditions not available for this pair",
			});
		}

		const pairConditions = conditions.data[tradingPair];

		// Check minimum order amount based on side and pair orientation
		const effectiveSide = isReversed
			? body.side === "SELL"
				? "BUY"
				: "SELL"
			: body.side;

		if (effectiveSide === "SELL") {
			const minAmount = parseFloat(pairConditions.minOrderAmountCcy1);
			if (body.amount < minAmount) {
				throw createError({
					statusCode: 400,
					statusMessage: `Order amount too small. Minimum amount is ${minAmount} ${isReversed ? body.counterCurrency : body.currency}`,
				});
			}
		} else {
			const minAmount = parseFloat(pairConditions.minOrderAmountCcy2);
			if (body.amount < minAmount) {
				throw createError({
					statusCode: 400,
					statusMessage: `Order amount too small. Minimum amount is ${minAmount} ${isReversed ? body.currency : body.counterCurrency}`,
				});
			}
		}

		// First check they have enough balance to do the trade
		const balanceSymbol = `${body.currency.toLowerCase()}_balance`;
		let getBalance = await client
			.from("profiles")
			.select(`${balanceSymbol}, trade_fee`);

		if (getBalance.error) {
			console.log(error);
			throw createError({
				statusCode: 400,
				statusMessage: error.message,
			});
		}
		console.log(getBalance.data[0][balanceSymbol]);
		if (body.sellAmount > getBalance.data[0][balanceSymbol]) {
			throw createError({
				statusCode: 400,
				statusMessage: "Insufficient balance",
			});
		}

		let fee = getBalance.data[0].trade_fee;
		let fee_decimal = fee / 100;

		// Place the trade
		const trade = await cexMarketOrderEstimate({
			side: body.side,
			currency: body.currency,
			counterCurrency: body.counterCurrency,
			amount: body.amount,
		});

		// Apply fees to the trade result
		let trade_fee_amount = 0;
		let adjusted_trade = { ...trade };

		if (body.side === "BUY") {
			// For buy, calculate fee on the receiving amount and reduce it
			trade_fee_amount = trade.receiveQuantity * fee_decimal;
			adjusted_trade.receiveQuantity = trade.receiveQuantity - trade_fee_amount;
			// Store original values for reference
			adjusted_trade.original_receiveQuantity = trade.receiveQuantity;
		} else if (body.side === "SELL") {
			// For sell, calculate fee on the receiving amount and reduce it
			trade_fee_amount = trade.receiveQuantity * fee_decimal;
			adjusted_trade.receiveQuantity = trade.receiveQuantity - trade_fee_amount;
			// Store original values for reference
			adjusted_trade.original_receiveQuantity = trade.receiveQuantity;
		}

		// Add fee information to the response
		adjusted_trade.trade_fee_amount = trade_fee_amount;
		adjusted_trade.trade_fee_percentage = fee;

		return adjusted_trade;
	} catch (error) {
		throw createError({
			statusCode: 400,
			statusMessage: error.statusMessage,
		});
	}
});
