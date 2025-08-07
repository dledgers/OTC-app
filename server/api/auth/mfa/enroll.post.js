import {
	serverSupabaseUser,
	serverSupabaseServiceRole,
} from "#supabase/server";
import Joi from "joi";

const schema = Joi.object({
	factorType: Joi.string().valid("totp").required(),
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

		const { factorType } = value;

		// Use service role client to enroll MFA factor
		const admin = serverSupabaseServiceRole(event);

		const { data, error: enrollError } = await admin.auth.mfa.enroll({
			factorType,
			userId: user.id,
		});

		if (enrollError) {
			throw createError({
				statusCode: 400,
				statusMessage: enrollError.message,
			});
		}

		return {
			success: true,
			data: {
				id: data.id,
				qr_code: data.totp?.qr_code,
				secret: data.totp?.secret,
				uri: data.totp?.uri,
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
			statusMessage: "Failed to enroll MFA factor",
		});
	}
});
