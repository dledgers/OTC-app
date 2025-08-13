import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import Joi from "joi";

const schema = Joi.object({
	requestId: Joi.number().integer().positive().required().messages({
		"number.integer": "Request ID must be an integer",
		"number.positive": "Request ID must be positive",
		"any.required": "Request ID is required",
	}),
});

export default eventHandler(async (event) => {
	const client = await serverSupabaseClient(event);
	const user = await serverSupabaseUser(event);

	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized - please log in",
		});
	}

	const body = await readBody(event);

	// Validate request body
	const { error, value } = schema.validate(body, { abortEarly: false });
	if (error) {
		throw createError({
			statusCode: 400,
			statusMessage: JSON.stringify({
				message: "Validation failed",
				details: error.details.map((detail) => ({
					field: detail.path.join("."),
					message: detail.message,
				})),
			}),
		});
	}

	try {
		// First, verify the withdrawal request exists and belongs to the user
		const { data: existingRequest, error: fetchError } = await client
			.from("eur_withdrawal_requests")
			.select("id, status, user_id")
			.eq("id", value.requestId)
			.eq("user_id", user.id)
			.single();

		if (fetchError || !existingRequest) {
			throw createError({
				statusCode: 404,
				statusMessage: "Withdrawal request not found",
			});
		}

		// Check if the request can be cancelled (only 'requested' status)
		if (existingRequest.status !== "requested") {
			throw createError({
				statusCode: 400,
				statusMessage: `Cannot cancel withdrawal request with status: ${existingRequest.status}. Only requests with status 'requested' can be cancelled.`,
			});
		}

		// Update the status to 'cancelled'
		const { data, error: updateError } = await client
			.from("eur_withdrawal_requests")
			.update({
				status: "cancelled",
				processed_at: new Date().toISOString(), // Mark when it was cancelled
			})
			.eq("id", value.requestId)
			.eq("user_id", user.id)
			.select()
			.single();

		if (updateError) {
			console.error("Update error:", updateError);
			throw createError({
				statusCode: 500,
				statusMessage: "Failed to cancel withdrawal request",
			});
		}

		// Return success response
		return {
			success: true,
			message: "EUR withdrawal request cancelled successfully",
			requestId: data.id,
			status: "cancelled",
		};
	} catch (error) {
		console.error("Cancel EUR withdrawal error:", error);

		// If it's already a createError, re-throw it
		if (error.statusCode) {
			throw error;
		}

		// Otherwise, create a generic error
		throw createError({
			statusCode: 500,
			statusMessage: error.message || "Internal server error",
		});
	}
});
