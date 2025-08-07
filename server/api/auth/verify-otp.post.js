import { serverSupabaseServiceRole } from "#supabase/server";
import Joi from "joi";

const schema = Joi.object({
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.messages({
			"string.email": `"email" must be a valid email address`,
		}),
	otp: Joi.string()
		.length(6)
		.pattern(/^[0-9]+$/)
		.required()
		.messages({
			"string.length": `"otp" must be exactly 6 digits`,
			"string.pattern.base": `"otp" must contain only digits`,
		}),
});

export default eventHandler(async (event) => {
	const admin = serverSupabaseServiceRole(event);
	const body = await readBody(event);

	// Validate the request body
	const { error, value } = schema.validate(body, { abortEarly: false });
	if (error) {
		throw createError({
			statusCode: 400,
			statusMessage: JSON.stringify(error.details),
		});
	}

	const { email, otp } = value;

	try {
		// Use service role client to verify OTP
		const { data, error: verifyError } = await admin.auth.verifyOtp({
			email,
			token: otp,
			type: "email",
		});

		if (verifyError) {
			throw createError({
				statusCode: 400,
				statusMessage: verifyError.message,
			});
		}

		// Return session data if successful
		return {
			success: true,
			message: "OTP verified successfully",
			session: data.session,
			user: data.user,
		};
	} catch (error) {
		// If it's already a createError, re-throw it
		if (error.statusCode) {
			throw error;
		}

		// Otherwise, create a generic error
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to verify OTP",
		});
	}
});
