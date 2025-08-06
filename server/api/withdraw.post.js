import {
	serverSupabaseClient,
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";
import Joi from "joi";

const schema = Joi.object({
	currency: Joi.string()
		.valid("BTC", "USDC", "EUR", "ETH", "TRX")
		.required()
		.messages({
			"any.only": `Currency must be one of [BTC, EUR, USDC]`,
			"any.required": `"pair" is a required field`,
		}),
	address: Joi.string().required().messages({
		"any.required": `"Address" is a required field`,
	}),
	network: Joi.string().valid("ETH", "TRON").allow(null).messages({
		"any.only": `Network must be one of [ETH, TRON]`,
		"any.required": `"Network" is a required field`,
	}),
	amount: Joi.number().positive().required().messages({
		"number.positive": `"Buy amount" must be a positive number`,
		"any.required": `"Buy amount" is a required field`,
	}),
});
// Below is an extension of the schma to validate the address based on the currency and network
// .when(Joi.object({ currency: "BTC" }).unknown(), {
// 	then: Joi.object({
// 		address: Joi.string()
// 			.regex(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)
// 			.messages({ "string.pattern.base": `Invalid BTC address` }),
// 	}),
// })
// .when(Joi.object({ currency: "USDC", network: "ETH" }).unknown(), {
// 	then: Joi.object({
// 		address: Joi.string()
// 			.regex(/^0x[a-fA-F0-9]{40}$/)
// 			.messages({ "string.pattern.base": `Invalid ETH address for USDC` }),
// 	}),
// })
// .when(Joi.object({ currency: "USDC", network: "TRON" }).unknown(), {
// 	then: Joi.object({
// 		address: Joi.string()
// 			.regex(/^T[a-zA-Z0-9]{33}$/)
// 			.messages({ "string.pattern.base": `Invalid TRON address for USDC` }),
// 	}),
// });
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
		const balanceSymbol = `${body.currency.toLowerCase()}_balance`;
		let getBalance = await client.from("profiles").select(balanceSymbol);

		if (getBalance.error) {
			console.log(error);
			throw createError({
				statusCode: 400,
				statusMessage: error.message,
			});
		}
		if (body.amount > getBalance.data[0][balanceSymbol]) {
			throw createError({
				statusCode: 400,
				statusMessage: "Insufficient balance",
			});
		}
		// Place the trade
		const transaction = await withdrawCrypto(
			body.amount,
			body.currency,
			body.address,
			body.network
		);

		// Store the trade into the database to have the function trigger to update balance
		const { error } = await admin.from("aquanow_transactions").insert([
			{
				account_id: transaction.accountId,
				network_type: transaction.networkType,
				address: transaction.address,
				quantity: transaction.quantity,
				bank_info: transaction.bankInfo || {},
				tx_id: transaction.txId,
				symbol: transaction.symbol,
				username: transaction.username,
				network_fee: transaction.networkFee,
				message: transaction.message || "",
				origin_user: transaction.originUser || "",
				source: transaction.source || "",
				transaction_type: transaction.transactionType,
				ip_address: transaction.ip_address || "",
				item_date_time: transaction.itemDateTime
					? new Date(transaction.itemDateTime)
					: null,
				is_autopilot_address: transaction.isAutopilotAddress || false,
				admin_approval: transaction.adminApproval,
				tx_hash: transaction.txHash || null,
				user_id: user.id,
			},
		]);
		if (error) {
			console.log(error);
			throw createError({
				statusCode: 400,
				statusMessage: "Trade failed",
			});
		}
		return;
	} catch (error) {
		throw createError({
			statusCode: 400,
			statusMessage: error.message,
		});
	}
});
