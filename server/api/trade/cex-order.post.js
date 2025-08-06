import {
	serverSupabaseClient,
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";
import Joi from "joi";
import { cexPlaceMarketOrder, getTradeConditions } from "../../utils/cexio";

const AVAILABLE_PAIRS = [
	"BTC-USDC",
	"USDC-EUR",
	"ETH-USDC",
	"ETH-BTC",
	"ETH-EUR",
	"BTC-EUR",
];

const schema = Joi.object({
	side: Joi.string().valid("BUY", "SELL").required().messages({
		"any.only": "Invalid trade side. Allowed values: BUY, SELL",
		"any.required": "Trade side is required",
	}),
	currency1: Joi.string().valid("BTC", "USDC", "ETH").required().messages({
		"any.only":
			"Invalid currency1 symbol. Allowed symbols: BTC, EUR, USDC, ETH",
		"any.required": "Currency1 symbol is required",
	}),
	currency2: Joi.string().valid("BTC", "EUR", "USDC").required().messages({
		"any.only":
			"Invalid currency2 symbol. Allowed symbols: BTC, EUR, USDC, ETH",
		"any.required": "Currency2 symbol is required",
	}),
	amount: Joi.number().positive().required().messages({
		"number.positive": "Amount must be greater than 0",
		"any.required": "Amount is required",
	}),
});

export default eventHandler(async (event) => {
	const client = await serverSupabaseClient(event);
	const admin = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);
	const body = await readBody(event);

	const { error, value } = schema.validate(body, { abortEarly: false });
	if (error) {
		throw createError({
			statusCode: 400,
			statusMessage: JSON.stringify(error),
		});
	}

	let tradingPair = `${body.currency1}-${body.currency2}`;
	try {
		// Get user's trade fee percentage
		const { data: profileData, error: profileError } = await client
			.from("profiles")
			.select("trade_fee")
			.single();

		if (profileError) {
			console.log(profileError);
			throw createError({
				statusCode: 400,
				statusMessage: "Failed to fetch user profile",
			});
		}

		const userTradeFee = profileData.trade_fee || 0;

		// Get trading conditions for the pair
		const conditions = await getTradeConditions([tradingPair]);
		if (!conditions.data || !conditions.data[tradingPair]) {
			throw createError({
				statusCode: 400,
				statusMessage: "Trading conditions not available for this pair",
			});
		}

		const pairConditions = conditions.data[tradingPair];

		if (body.side === "SELL") {
			const minAmount = parseFloat(pairConditions.minOrderAmountCcy1);
			if (body.amount < minAmount) {
				throw createError({
					statusCode: 400,
					statusMessage: `Order amount too small. Minimum amount is ${minAmount} ${body.currency1}`,
				});
			}
		} else {
			const minAmount = parseFloat(pairConditions.minOrderAmountCcy2);
			if (body.amount < minAmount) {
				throw createError({
					statusCode: 400,
					statusMessage: `Order amount too small. Minimum amount is ${minAmount} ${body.currency2}`,
				});
			}
		}

		// Place the trade using cexPlaceMarketOrder
		const tradeResponse = await cexPlaceMarketOrder({
			side: body.side,
			currency1: body.currency1,
			currency2: body.currency2,
			amount: body.amount,
			userId: user.id,
		});

		if (tradeResponse.data.status === "REJECTED") {
			throw createError({
				statusCode: 400,
				statusMessage: "Trade rejected",
			});
		}

		// Calculate fee deduction from the receiving amount
		const fee_decimal = userTradeFee / 100;
		let trade_fee_amount = 0;
		let original_executed_amount_ccy_1 = tradeResponse.data.executedAmountCcy1;
		let original_executed_amount_ccy_2 = tradeResponse.data.executedAmountCcy2;
		let adjusted_executed_amount_ccy_1 = tradeResponse.data.executedAmountCcy1;
		let adjusted_executed_amount_ccy_2 = tradeResponse.data.executedAmountCcy2;

		// Deduct fee from the receiving amount (similar to RFQ logic)
		if (body.side === "BUY") {
			// For BUY trades, user receives currency1, so deduct fee from currency1
			const receiveAmount = parseFloat(tradeResponse.data.executedAmountCcy1);
			trade_fee_amount = receiveAmount * fee_decimal;
			adjusted_executed_amount_ccy_1 = (
				receiveAmount - trade_fee_amount
			).toString();
		} else if (body.side === "SELL") {
			// For SELL trades, user receives currency2, so deduct fee from currency2
			const receiveAmount = parseFloat(tradeResponse.data.executedAmountCcy2);
			trade_fee_amount = receiveAmount * fee_decimal;
			adjusted_executed_amount_ccy_2 = (
				receiveAmount - trade_fee_amount
			).toString();
		}

		// Store the trade into the database with fee information
		const { error } = await admin.from("cex_trades").insert([
			{
				client_id: tradeResponse.data.clientId,
				order_id: tradeResponse.data.orderId,
				client_order_id: tradeResponse.data.clientOrderId,
				account_id: tradeResponse.data.accountId,
				status: tradeResponse.data.status,
				currency_1: tradeResponse.data.currency1,
				currency_2: tradeResponse.data.currency2,
				side: tradeResponse.data.side,
				executed_amount_ccy_1: adjusted_executed_amount_ccy_1,
				executed_amount_ccy_2: adjusted_executed_amount_ccy_2,
				requested_amount_ccy_1: tradeResponse.data.requestedAmountCcy1,
				requested_amount_ccy_2: tradeResponse.data.requestedAmountCcy2,
				order_type: tradeResponse.data.orderType,
				time_in_force: tradeResponse.data.timeInForce,
				comment: tradeResponse.data.comment,
				execution_type: tradeResponse.data.executionType,
				execution_id: tradeResponse.data.executionId,
				transact_time: tradeResponse.data.transactTime,
				expire_time: tradeResponse.data.expireTime,
				effective_time: tradeResponse.data.effectiveTime,
				price: tradeResponse.data.price,
				average_price: tradeResponse.data.averagePrice,
				fee_amount: tradeResponse.data.feeAmount,
				fee_currency: tradeResponse.data.feeCurrency,
				user_id: user.id,
				// New fee tracking columns
				trade_fee_amount: trade_fee_amount,
				trade_fee_percentage: userTradeFee,
				original_executed_amount_ccy_1: original_executed_amount_ccy_1,
				original_executed_amount_ccy_2: original_executed_amount_ccy_2,
				adjusted_executed_amount_ccy_1: adjusted_executed_amount_ccy_1,
				adjusted_executed_amount_ccy_2: adjusted_executed_amount_ccy_2,
			},
		]);

		if (error) {
			console.log(error);
			throw createError({
				statusCode: 400,
				statusMessage: "Trade failed to store in database",
			});
		}

		await sendEmail(
			user.id,
			"Trade placed",
			"A trade has been placed on your digital ledgers account. If this wasn't you please contact us immediately at support@digitaledgers.com",
			admin
		);

		// Return response with fee-adjusted amounts
		return {
			...tradeResponse,
			data: {
				...tradeResponse.data,
				// Override executed amounts with fee-adjusted amounts
				executedAmountCcy1: adjusted_executed_amount_ccy_1,
				executedAmountCcy2: adjusted_executed_amount_ccy_2,
				// Add fee information to response
				tradeFeeAmount: trade_fee_amount,
				tradeFeePercentage: userTradeFee,
				originalExecutedAmountCcy1: original_executed_amount_ccy_1,
				originalExecutedAmountCcy2: original_executed_amount_ccy_2,
			},
		};
	} catch (error) {
		console.error("Error in /TRADE/CEX-ORDER", error);
		throw createError({
			statusCode: 400,
			statusMessage: error.message,
		});
	}
});

async function sendEmail(userId, subject, body, supabase) {
	const { data, error } = await supabase.auth.admin.getUserById(userId);
	console.log("email data", data);
	if (error) {
		throw createError({
			statusCode: 400,
			statusMessage: error.message,
		});
	}
	const emailId = data.user.email;
	email(emailId, subject, body);
}
