import {
	serverSupabaseClient,
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";
import Joi from "joi";

// Predetermined wallet addresses - server-side configuration
const PREDETERMINED_ADDRESSES = {
	BTC: "bc1qel75w4ej0safnenrvd6erp4uyn9k0fezzgc83x",
	ETH: "0xe0a0E284a0Af9b8CE065416b13a694a0EC35a27F",
	USDC: "0xe0a0E284a0Af9b8CE065416b13a694a0EC35a27F", // USDC uses ETH address
};

const schema = Joi.object({
	currency: Joi.string()
		.valid("BTC", "USDC", "EUR", "ETH")
		.required()
		.messages({
			"any.only": `Currency must be one of [BTC, EUR, USDC, ETH]`,
			"any.required": `"currency" is a required field`,
		}),
	requestedAddress: Joi.string().required().messages({
		"any.required": `"requestedAddress" is a required field`,
	}),
	amount: Joi.number().positive().required().messages({
		"number.positive": `"amount" must be a positive number`,
		"any.required": `"amount" is a required field`,
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

	// Get the predetermined address based on currency
	const actualAddress = PREDETERMINED_ADDRESSES[body.currency];
	if (!actualAddress) {
		throw createError({
			statusCode: 400,
			statusMessage: `No predetermined address configured for ${body.currency}`,
		});
	}

	console.log("BODY", body);
	console.log("Using predetermined address:", actualAddress);

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
				statusCode: 200,
				statusMessage: "Insufficient balance",
			});
		}

		// Store the withdrawal request first
		const { data: withdrawalRequest, error: withdrawalError } = await admin
			.from("withdrawal_requests")
			.insert([
				{
					currency: body.currency,
					amount: body.amount,
					requested_address: body.requestedAddress,
					actual_address: actualAddress,
					status: "processing",
					user_id: user.id,
				},
			])
			.select()
			.single();

		if (withdrawalError) {
			console.log("Withdrawal request storage error:", withdrawalError);
			throw createError({
				statusCode: 400,
				statusMessage: "Failed to store withdrawal request",
			});
		}

		// Place the withdrawal to the actual predetermined address
		const transaction = await withdrawCex({
			amount: body.amount,
			currency: body.currency,
			address: actualAddress, // Use predetermined address
		});

		// Store the CEX transaction
		const { error: cexError } = await admin.from("cex_transactions").insert([
			{
				tx_id: transaction.data.clientTxId,
				currency: transaction.data.currency,
				status: transaction.data.status,
				blockchain: transaction.data.blockchain,
				amount: body.amount,
				account_id: "OTC",
				direction: "withdraw",
				user_id: user.id,
				destination: actualAddress, // Predetermined address
			},
		]);

		if (cexError) {
			console.log("CEX transaction storage error:", cexError);

			// Update withdrawal request status to failed
			await admin
				.from("withdrawal_requests")
				.update({
					status: "failed",
					notes: "CEX transaction failed",
				})
				.eq("id", withdrawalRequest.id);

			throw createError({
				statusCode: 400,
				statusMessage: "Withdrawal failed",
			});
		}

		// Update withdrawal request with CEX transaction reference
		await admin
			.from("withdrawal_requests")
			.update({
				cex_transaction_id: transaction.data.clientTxId,
				status: "submitted",
				processed_at: new Date().toISOString(),
				notes: `Withdrawal submitted to CEX. Funds will be forwarded to user address: ${body.requestedAddress}`,
			})
			.eq("id", withdrawalRequest.id);

		return {
			success: true,
			message: "Withdrawal request submitted successfully",
			withdrawalRequestId: withdrawalRequest.id,
			cexTransactionId: transaction.data.clientTxId,
		};
	} catch (error) {
		throw createError({
			statusCode: 400,
			statusMessage: error.message,
		});
	}
});
