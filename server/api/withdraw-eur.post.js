import {
	serverSupabaseClient,
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";
import Joi from "joi";
import { email } from "~~/server/utils/resend.js";

const schema = Joi.object({
	amount: Joi.number().positive().min(10).required().messages({
		"number.positive": "Amount must be a positive number",
		"number.min": "Minimum withdrawal amount is €10",
		"any.required": "Amount is a required field",
	}),
	currency: Joi.string().valid("EUR").required().messages({
		"any.only": "Currency must be EUR",
		"any.required": "Currency is a required field",
	}),
	// Beneficiary Information
	beneficiaryName: Joi.string().trim().min(2).max(100).required().messages({
		"string.min": "Beneficiary name must be at least 2 characters",
		"string.max": "Beneficiary name cannot exceed 100 characters",
		"any.required": "Beneficiary name is required",
	}),
	beneficiaryAddress: Joi.string().trim().min(5).max(255).required().messages({
		"string.min": "Beneficiary address must be at least 5 characters",
		"string.max": "Beneficiary address cannot exceed 255 characters",
		"any.required": "Beneficiary address is required",
	}),
	beneficiaryCity: Joi.string().trim().min(2).max(100).required().messages({
		"string.min": "City must be at least 2 characters",
		"string.max": "City cannot exceed 100 characters",
		"any.required": "City is required",
	}),
	beneficiaryPostalCode: Joi.string()
		.trim()
		.min(3)
		.max(20)
		.required()
		.messages({
			"string.min": "Postal code must be at least 3 characters",
			"string.max": "Postal code cannot exceed 20 characters",
			"any.required": "Postal code is required",
		}),
	beneficiaryCountry: Joi.string().length(2).uppercase().required().messages({
		"string.length": "Country must be a 2-letter country code",
		"any.required": "Country is required",
	}),
	beneficiaryEmail: Joi.string().email().allow(null, "").messages({
		"string.email": "Invalid email format",
	}),
	beneficiaryPhone: Joi.string().trim().allow(null, "").messages({}),
	// Bank Information
	iban: Joi.string().trim().min(15).max(34).required().messages({
		"string.min": "IBAN must be at least 15 characters",
		"string.max": "IBAN cannot exceed 34 characters",
		"any.required": "IBAN is required",
	}),
	bicSwift: Joi.string().trim().min(8).max(11).required().messages({
		"string.min": "BIC/SWIFT code must be at least 8 characters",
		"string.max": "BIC/SWIFT code cannot exceed 11 characters",
		"any.required": "BIC/SWIFT code is required",
	}),
	bankName: Joi.string().trim().min(2).max(100).required().messages({
		"string.min": "Bank name must be at least 2 characters",
		"string.max": "Bank name cannot exceed 100 characters",
		"any.required": "Bank name is required",
	}),
	bankAddress: Joi.string().trim().allow(null, "").max(255).messages({
		"string.max": "Bank address cannot exceed 255 characters",
	}),
	// Transfer Details
	transferReference: Joi.string().trim().allow(null, "").max(140).messages({
		"string.max": "Transfer reference cannot exceed 140 characters",
	}),
	transferPurpose: Joi.string()
		.valid(
			"business_payment",
			"salary",
			"investment_return",
			"service_payment",
			"other"
		)
		.required()
		.messages({
			"any.only": "Invalid transfer purpose",
			"any.required": "Transfer purpose is required",
		}),
});

export default eventHandler(async (event) => {
	const client = await serverSupabaseClient(event);
	const admin = serverSupabaseServiceRole(event);
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
		// Check user's EUR balance
		const { data: profileData, error: profileError } = await client
			.from("profiles")
			.select("eur_balance")
			.eq("user_id", user.id)
			.single();

		if (profileError) {
			console.error("Profile fetch error:", profileError);
			throw createError({
				statusCode: 400,
				statusMessage: "Unable to fetch user profile",
			});
		}

		const availableBalance = profileData?.eur_balance || 0;
		if (value.amount > availableBalance) {
			throw createError({
				statusCode: 400,
				statusMessage: "Insufficient EUR balance",
			});
		}

		// Clean and format IBAN (remove spaces)
		const cleanIban = value.iban.replace(/\s/g, "").toUpperCase();

		// Insert EUR withdrawal request into database
		const { data, error: insertError } = await admin
			.from("eur_withdrawal_requests")
			.insert([
				{
					user_id: user.id,
					amount: value.amount,
					currency: "EUR",
					status: "requested",
					beneficiary_name: value.beneficiaryName,
					beneficiary_address: value.beneficiaryAddress,
					beneficiary_city: value.beneficiaryCity,
					beneficiary_postal_code: value.beneficiaryPostalCode,
					beneficiary_country: value.beneficiaryCountry,
					beneficiary_email: value.beneficiaryEmail || null,
					beneficiary_phone: value.beneficiaryPhone || null,
					iban: cleanIban,
					bic_swift: value.bicSwift.toUpperCase(),
					bank_name: value.bankName,
					bank_address: value.bankAddress || null,
					transfer_reference: value.transferReference || null,
					transfer_purpose: value.transferPurpose,
				},
			])
			.select()
			.single();

		if (insertError) {
			console.error("Insert error:", insertError);
			throw createError({
				statusCode: 500,
				statusMessage: "Failed to submit withdrawal request",
			});
		}

		// Get user email for confirmation
		const { data: userData, error: userError } =
			await admin.auth.admin.getUserById(user.id);
		const userEmail = userData?.user?.email;

		// Send confirmation email
		if (userEmail) {
			try {
				await email(
					userEmail,
					"EUR Withdrawal Request Received - Digital Ledgers",
					`
					<div style="text-align: left; max-width: 600px; margin: 0 auto;">
						<p>Dear valued client,</p>
						
						<p>We have successfully received your EUR withdrawal request with the following details:</p>
						
						<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
							<h3 style="margin: 0 0 15px 0; color: #1f1f1f;">Withdrawal Details</h3>
							<p><strong>Request ID:</strong> #${data.id}</p>
							<p><strong>Amount:</strong> €${value.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
							<p><strong>Beneficiary:</strong> ${value.beneficiaryName}</p>
							<p><strong>Bank:</strong> ${value.bankName}</p>
							<p><strong>IBAN:</strong> ${cleanIban}</p>
							<p><strong>Purpose:</strong> ${value.transferPurpose.replace("_", " ").toUpperCase()}</p>
							<p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: 600;">PENDING REVIEW</span></p>
						</div>
						
						<h3 style="color: #1f1f1f;">What happens next?</h3>
						<ul style="line-height: 1.6;">
							<li><strong>Review Process:</strong> Our compliance team will review your request within 1-2 business days</li>
							<li><strong>Verification:</strong> We may contact you if additional documentation is required</li>
							<li><strong>Processing:</strong> Once approved, the SEPA transfer will be processed within 1-2 business days</li>
							<li><strong>Confirmation:</strong> You will receive an email notification when the transfer is completed</li>
						</ul>
						
						<div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
							<p style="margin: 0; color: #92400e;"><strong>Important:</strong> Please ensure your IBAN details are correct. Incorrect banking information may result in delays or additional fees.</p>
						</div>
						
						<p>If you have any questions or need to modify your request, please contact our support team immediately at support@digitaledgers.com.</p>
						
						<p>Thank you for choosing Digital Ledgers.</p>
						
						<p style="margin-top: 30px;">
							Best regards,<br>
							<strong>Digital Ledgers Team</strong>
						</p>
					</div>
					`
				);
			} catch (emailError) {
				console.error("Failed to send confirmation email:", emailError);
				// Don't fail the withdrawal request if email fails
			}
		}

		// Return success response with request ID
		return {
			success: true,
			message: "EUR withdrawal request submitted successfully",
			requestId: data.id,
			status: "requested",
		};
	} catch (error) {
		console.error("EUR withdrawal error:", error);

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
