import {
	serverSupabaseUser,
	serverSupabaseServiceRole,
} from "#supabase/server";
import Joi from "joi";

const schema = Joi.object({
	factorId: Joi.string().required(),
	challengeId: Joi.string().required(),
	code: Joi.string()
		.length(6)
		.pattern(/^[0-9]+$/)
		.required()
		.messages({
			"string.length": `"code" must be exactly 6 digits`,
			"string.pattern.base": `"code" must contain only digits`,
		}),
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

		const { factorId, challengeId, code } = value;

		// Use service role client to verify MFA
		const admin = serverSupabaseServiceRole(event);

		const { data, error: verifyError } = await admin.auth.mfa.verify({
			factorId,
			challengeId,
			code,
			userId: user.id,
		});

		if (verifyError) {
			throw createError({
				statusCode: 400,
				statusMessage: verifyError.message,
			});
		}

		return {
			success: true,
			message: "MFA verification successful",
			data: {
				user: data.user,
				session: data.session,
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
			statusMessage: "Failed to verify MFA",
		});
	}
});
