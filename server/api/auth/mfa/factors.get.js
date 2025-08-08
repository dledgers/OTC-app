import {
	serverSupabaseUser,
	serverSupabaseServiceRole,
} from "#supabase/server";

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

		// Use service role client to list factors
		const admin = serverSupabaseServiceRole(event);

		const { data, error } = await admin.auth.mfa.listFactors();

		if (error) {
			throw createError({
				statusCode: 400,
				statusMessage: error.message,
			});
		}

		return {
			success: true,
			data: {
				totp: data.totp || [],
				phone: data.phone || [],
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
			statusMessage: "Failed to list MFA factors",
		});
	}
});
