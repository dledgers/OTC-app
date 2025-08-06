import {
	serverSupabaseClient,
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";
import Joi from "joi";

const schema = Joi.object({
	quoteId: Joi.string()
		.uuid({ version: ["uuidv4", "uuidv5"] })
		.required()
		.messages({
			"string.guid": "Invalid UUID format",
			"any.required": "UUID is required",
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
		// Place the trade
		const trade = await expireRFQQuote(body.quoteId);
		// Check if trade was fine
		console.log("/TRADE/EXPIRE-RFQ", trade);
		// Store the trade into the database to have the function trigger to update balance
		const { error } = await admin
			.from("aquanow_trades")
			.update([
				{
					rfq_status: "expire",
				},
			])
			.eq("quote_id", body.quoteId);
		if (error) {
			console.log(error);
			throw createError({
				statusCode: 400,
				statusMessage: "Trade failed",
			});
		}
		return trade;
	} catch (error) {
		throw createError({
			statusCode: 400,
			statusMessage: error.message,
		});
	}
});
