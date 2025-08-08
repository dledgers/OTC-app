import { navigateTo } from "#app";
import { useLocalePath } from "#i18n";

export default defineNuxtRouteMiddleware(async (to, from) => {
	const user = useSupabaseUser();
	const localePath = useLocalePath();
	// If user is not authenticated, redirect to login
	if (!user.value) {
		return navigateTo("/login");
	}

	// Skip MFA check for certain routes
	const excludedRoutes = [
		"/mfa-enroll",
		"/mfa-verify",
		"/login",
		"/apply",
		"/confirm",
	];
	if (excludedRoutes.includes(to.path)) {
		return;
	}

	// Check MFA status
	try {
		const supabase = useSupabaseClient();
		const { data, error } =
			await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

		if (error) {
			console.error("Error checking MFA status:", error);
			return;
		}

		// If user doesn't have MFA enrolled (currentLevel is aal1 and nextLevel is aal1)
		if (data.currentLevel === "aal1" && data.nextLevel === "aal1") {
			// User doesn't have MFA enrolled, redirect to enrollment
			return navigateTo(localePath("/mfa-enroll"));
		}

		// If user has MFA enrolled but hasn't verified it yet (currentLevel is aal1 and nextLevel is aal2)
		if (data.currentLevel === "aal1" && data.nextLevel === "aal2") {
			// User has MFA enrolled but needs to verify it
			return navigateTo(localePath("/mfa-verify"));
		}
	} catch (error) {
		console.error("MFA check error:", error);
	}
});
