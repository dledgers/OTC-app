import { serverSupabaseServiceRole } from "#supabase/server";
import Joi from "joi";

// Function to verify Cloudflare Turnstile CAPTCHA
async function verifyCaptcha(token, event) {
	const config = useRuntimeConfig();
	const ip = getClientIP(event) || "";

	console.log("CAPTCHA verification attempt:", {
		hasToken: !!token,
		hasSecret: !!config.cloudflareSecretKey,
		ip,
	});

	const formData = new FormData();
	formData.append("secret", config.cloudflareSecretKey || "");
	formData.append("response", token);
	formData.append("remoteip", ip);

	try {
		const result = await fetch(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			{
				method: "POST",
				body: formData,
			}
		);

		const outcome = await result.json();
		console.log("CAPTCHA verification result:", outcome);
		return outcome;
	} catch (error) {
		console.error("CAPTCHA verification error:", error);
		return { success: false, error: error.message };
	}
}

const schema = Joi.object({
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.messages({
			"string.email": `"email" must be a valid email address`,
		}),
	captchaToken: Joi.string().required().messages({
		"any.required": "CAPTCHA verification is required",
	}),
});

export default eventHandler(async (event) => {
	console.log("=== SEND OTP ENDPOINT HIT ===", new Date().toISOString());

	try {
		const admin = serverSupabaseServiceRole(event);
		const body = await readBody(event);

		console.log("Request body received:", {
			email: body?.email,
			hasCaptcha: !!body?.captchaToken,
			bodyKeys: body ? Object.keys(body) : "no body",
		});

		// Validate the request body
		const { error, value } = schema.validate(body, { abortEarly: false });
		if (error) {
			console.error("Validation error:", error.details);
			throw createError({
				statusCode: 400,
				statusMessage: JSON.stringify(error.details),
			});
		}

		const { email, captchaToken } = value;

		// Verify CAPTCHA token with Cloudflare Turnstile (skip in development)
		if (captchaToken !== "dev-bypass") {
			const captchaVerification = await verifyCaptcha(captchaToken, event);

			if (!captchaVerification.success) {
				throw createError({
					statusCode: 400,
					statusMessage: "CAPTCHA verification failed",
				});
			}
		} else {
			console.warn("CAPTCHA verification bypassed for development");
		}

		// Use service role client to send OTP with shouldCreateUser: false
		console.log("Attempting Supabase OTP send for email:", email);
		const { error: otpError } = await admin.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: false,
				captchaToken, // Pass captcha token to Supabase
			},
		});

		console.log("Supabase OTP result:", {
			error: otpError ? otpError.message : "success",
		});

		if (otpError) {
			// Check if the error is due to user not existing
			if (
				otpError.message.includes("User not found") ||
				otpError.message.includes("email not confirmed")
			) {
				throw createError({
					statusCode: 404,
					statusMessage: "Email not registered",
				});
			}

			throw createError({
				statusCode: 400,
				statusMessage: otpError.message,
			});
		}

		return {
			success: true,
			message: "OTP sent successfully",
		};
	} catch (error) {
		console.error("Send OTP Error:", error);

		// If it's already a createError, re-throw it
		if (error.statusCode) {
			throw error;
		}

		// Otherwise, create a generic error
		throw createError({
			statusCode: 500,
			statusMessage: `Failed to send OTP: ${error.message}`,
		});
	}
});
