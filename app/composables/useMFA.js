export const useMFA = () => {
	const supabase = useSupabaseClient();

	/**
	 * Get the current MFA status for the authenticated user
	 * @returns {Promise<{currentLevel: string, nextLevel: string, error?: object}>}
	 */
	const getMFAStatus = async () => {
		try {
			const { data, error } =
				await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

			if (error) {
				console.error("Error getting MFA status:", error);
				return { error, currentLevel: "aal1", nextLevel: "aal1" };
			}

			return {
				currentLevel: data.currentLevel,
				nextLevel: data.nextLevel,
				needsEnrollment:
					data.currentLevel === "aal1" && data.nextLevel === "aal1",
				needsVerification:
					data.currentLevel === "aal1" && data.nextLevel === "aal2",
				isFullyVerified:
					data.currentLevel === "aal2" && data.nextLevel === "aal2",
			};
		} catch (error) {
			console.error("MFA status check failed:", error);
			return { error, currentLevel: "aal1", nextLevel: "aal1" };
		}
	};

	/**
	 * List all MFA factors for the current user
	 * @returns {Promise<{totp: Array, phone: Array, error?: object}>}
	 */
	const listMFAFactors = async () => {
		try {
			const { data, error } = await supabase.auth.mfa.listFactors();

			if (error) {
				console.error("Error listing MFA factors:", error);
				return { error, totp: [], phone: [] };
			}

			return {
				totp: data.totp || [],
				phone: data.phone || [],
				hasFactors: data.totp?.length > 0 || data.phone?.length > 0,
			};
		} catch (error) {
			console.error("Failed to list MFA factors:", error);
			return { error, totp: [], phone: [] };
		}
	};

	/**
	 * Check if user needs to go through MFA flow
	 * @returns {Promise<{needsEnrollment: boolean, needsVerification: boolean, factorId?: string}>}
	 */
	const checkMFAFlow = async () => {
		const status = await getMFAStatus();

		if (status.needsEnrollment) {
			return { needsEnrollment: true, needsVerification: false };
		}

		if (status.needsVerification) {
			const factors = await listMFAFactors();
			const totpFactor = factors.totp?.[0];

			return {
				needsEnrollment: false,
				needsVerification: true,
				factorId: totpFactor?.id,
			};
		}

		return { needsEnrollment: false, needsVerification: false };
	};

	/**
	 * Enroll a new TOTP factor
	 * @returns {Promise<{data?: object, error?: object}>}
	 */
	const enrollTOTP = async () => {
		try {
			const { data, error } = await supabase.auth.mfa.enroll({
				factorType: "totp",
			});

			if (error) {
				console.error("Error enrolling TOTP:", error);
				return { error };
			}

			return { data };
		} catch (error) {
			console.error("TOTP enrollment failed:", error);
			return { error };
		}
	};

	/**
	 * Create a challenge for MFA verification
	 * @param {string} factorId - The ID of the factor to challenge
	 * @returns {Promise<{challengeId?: string, error?: object}>}
	 */
	const createChallenge = async (factorId) => {
		try {
			const { data, error } = await supabase.auth.mfa.challenge({ factorId });

			if (error) {
				console.error("Error creating MFA challenge:", error);
				return { error };
			}

			return { challengeId: data.id };
		} catch (error) {
			console.error("Failed to create MFA challenge:", error);
			return { error };
		}
	};

	/**
	 * Verify MFA code
	 * @param {string} factorId - The ID of the factor
	 * @param {string} challengeId - The challenge ID
	 * @param {string} code - The verification code
	 * @returns {Promise<{success: boolean, error?: object}>}
	 */
	const verifyMFA = async (factorId, challengeId, code) => {
		try {
			const { error } = await supabase.auth.mfa.verify({
				factorId,
				challengeId,
				code,
			});

			if (error) {
				console.error("Error verifying MFA:", error);
				return { success: false, error };
			}

			return { success: true };
		} catch (error) {
			console.error("MFA verification failed:", error);
			return { success: false, error };
		}
	};

	return {
		getMFAStatus,
		listMFAFactors,
		checkMFAFlow,
		enrollTOTP,
		createChallenge,
		verifyMFA,
	};
};
