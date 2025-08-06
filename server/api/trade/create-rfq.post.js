import {
	serverSupabaseClient,
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";
import Joi from "joi";

const schema = Joi.object({
	pair: Joi.string()
		.valid(
			"BTC-EUR",
			"BTC-USDC",
			"USDC-EUR",
			"TRX-USDC",
			"ETH-USDC",
			"ETH-BTC",
			"ETH-EUR"
		)
		.required()
		.messages({
			"any.only":
				"Invalid pair selected. Allowed pairs: BTC-EUR, BTC-USDC, USDC-EUR",
			"any.required": "Pair is required",
		}),
	tradeSide: Joi.string().valid("buy", "sell").required().messages({
		"any.only": "Invalid trade side. Allowed values: buy, sell",
		"any.required": "Trade side is required",
	}),
	buySymbol: Joi.string()
		.valid("BTC", "EUR", "USDC", "TRX", "ETH")
		.required()
		.messages({
			"any.only": "Invalid buy symbol. Allowed symbols: BTC, EUR, USDC",
			"any.required": "Buy symbol is required",
		}),
	sellSymbol: Joi.string()
		.valid("BTC", "EUR", "USDC", "TRX", "ETH")
		.required()
		.messages({
			"any.only": "Invalid sell symbol. Allowed symbols: BTC, EUR, USDC",
			"any.required": "Sell symbol is required",
		}),
	buyAmount: Joi.number().positive().required().messages({
		"number.positive": "Buy amount must be greater than 0",
		"any.required": "Buy amount is required",
	}),
	sellAmount: Joi.number().positive().required().messages({
		"number.positive": "Sell amount must be greater than 0",
		"any.required": "Sell amount is required",
	}),
});

export default eventHandler(async (event) => {
	const client = await serverSupabaseClient(event);
	const admin = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);
	const body = await readBody(event);
	//validate body
	const { error, value } = schema.validate(body, { abortEarly: false });
	if (error) {
		// console.error("Validation error:", error);
		throw createError({
			statusCode: 400,
			statusMessage: JSON.stringify(error),
		});
	}

	try {
		// First check they have enough balance to do the trade
		const balanceSymbol = `${body.sellSymbol.toLowerCase()}_balance`;
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
		// Place the trade
		const trade = await requestRFQQuote(
			body.sellAmount,
			body.pair,
			body.tradeSide
		);
		// Check if trade was fine
		if (trade.payload.receiveQuantity === 0 && trade.payload.deliverQuantity) {
			throw createError({
				statusCode: 400,
				statusMessage: "Order not filled",
			});
		}
		console.log("/TRADE", trade);

		// Store the trade into the database to have the function trigger to update balance
		let fee = getBalance.data[0].trade_fee;
		let rfq_price = trade.payload.price;
		let actual_rfq_price = trade.payload.price;
		let receive_quantity = trade.payload.receiveQuantity;
		let actual_receive_quantity = trade.payload.receiveQuantity;
		let deliver_quantity = trade.payload.deliverQuantity;
		let trade_fee_amount = 0;

		let fee_decimal = fee / 100;

		if (body.tradeSide === "buy") {
			// For buy, increase the price by the fee percentage
			rfq_price = rfq_price * (1 + fee_decimal);
			// Calculate the fee amount
			trade_fee_amount = receive_quantity * fee_decimal;
			// Reduce the actual receive quantity by the fee amount
			receive_quantity = receive_quantity - trade_fee_amount;
		} else if (body.tradeSide === "sell") {
			// For sell, decrease the price by the fee percentage
			rfq_price = rfq_price * (1 - fee_decimal);
			// Calculate the fee amount
			trade_fee_amount = receive_quantity * fee_decimal;
			// Increase the actual deliver quantity by the fee amount
			receive_quantity = receive_quantity - trade_fee_amount;
		}

		const { error } = await admin.from("aquanow_trades").insert([
			{
				quote_id: trade.payload.quoteId,
				rfq_price: rfq_price,
				actual_rfq_price: actual_rfq_price,
				quoteTime: trade.payload.quoteTime,
				expireTime: trade.payload.expireTime,
				rfq_status: "request",
				receive_currency: trade.payload.receiveCurrency,
				deliver_currency: trade.payload.deliverCurrency,
				receive_quantity: receive_quantity,
				deliver_quantity: deliver_quantity,
				actual_receive_quantity: actual_receive_quantity,
				account_id: trade.payload.accountId,
				trade_side: body.tradeSide,
				pair: body.pair,
				user_id: user.id,
				executed_by: "user",
				trade_fee_amount: trade_fee_amount,
			},
		]);
		if (error) {
			console.log(error);
			throw createError({
				statusCode: 400,
				statusMessage: "Trade failed",
			});
		}
		return {
			symbol: body.pair,
			price: rfq_price,
			receiveQuantity: receive_quantity,
			expireTime: trade.payload.expireTime,
			quoteId: trade.payload.quoteId,
			actual_receive_quantity: actual_receive_quantity,
			trade_fee_amount: trade_fee_amount,
			actual_rfq_price: actual_rfq_price,
		};
	} catch (error) {
		throw createError({
			statusCode: 400,
			statusMessage: error.message,
		});
	}
});
