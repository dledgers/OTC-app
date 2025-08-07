import {
	serverSupabaseUser,
	serverSupabaseServiceRole,
} from "#supabase/server";
import Joi from "joi";

const schema = Joi.object({
	factorId: Joi.string().required(),
});

export default eventHandler(async (event) => {
	try {
		// Get the authenticated user
		const user = await serverSupabaseUser(event);
		if (!user) {
			throw createError({
				statusCode: 401,
				statusMessage: "Unauthorized",
			});
		}

		const body = await readBody(event);

		// Validate the request body
		const { error, value } = schema.validate(body, { abortEarly: false });
		if (error) {
			throw createError({
				statusCode: 400,
				statusMessage: JSON.stringify(error.details),
			});
		}

		const { factorId } = value;

		// Use service role client to create MFA challenge
		const admin = serverSupabaseServiceRole(event);

		const { data, error: challengeError } = await admin.auth.mfa.challenge({
			factorId,
			userId: user.id,
		});

		if (challengeError) {
			throw createError({
				statusCode: 400,
				statusMessage: challengeError.message,
			});
		}

		return {
			success: true,
			data: {
				id: data.id,
				expiresAt: data.expires_at,
			},
		};
	} catch (error) {
		// If it's already a createError, re-throw it
		if (error.statusCode) {
			throw error;
		}

		// Otherwise, create a generic error
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create MFA challenge",
		});
	}
});
