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
		const trade = await executeRFQQuote(body.quoteId);
		// Check if trade was fine
		console.log("/TRADE/EXECUTE-RFQ", trade);
		// Store the trade into the database to have the function trigger to update balance
		const { error } = await admin
			.from("aquanow_trades")
			.update([
				{
					rfq_status: "execute",
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
		await sendEmail(
			user.id,
			"Trade placed",
			"A trade has been placed on your digital ledgers account. If this wasn't you please contact us immediately at support@digitaledgers.com",
			admin
		);
		return trade;
	} catch (error) {
		console.error("Error in /TRADE/EXECUTE-RFQ", error);
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
