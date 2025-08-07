import {
	serverSupabaseUser,
	serverSupabaseServiceRole,
} from "#supabase/server";
import Joi from "joi";

// Function to verify Cloudflare Turnstile CAPTCHA
async function verifyCaptcha(token, event) {
	const config = useRuntimeConfig();
	const ip = getRequestIP(event) || "";

	console.log("CAPTCHA verification attempt (signup):", {
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
		console.log("CAPTCHA verification result (signup):", outcome);
		return outcome;
	} catch (error) {
		console.error("CAPTCHA verification error (signup):", error);
		return { success: false, error: error.message };
	}
}

export default eventHandler(async (event) => {
	const admin = serverSupabaseServiceRole(event);

	// Parse multipart form data
	const formData = await readMultipartFormData(event);
	if (!formData) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid form data",
		});
	}

	// Convert form data array to object with proper handling of array notation
	const body = {};
	formData.forEach((item) => {
		const name = item.name;
		let value = item.data.toString();

		// Special handling for boolean values and phone/postal code fields
		if (name === "sameAddress") {
			value = value === "true";
		} else if (
			name === "phoneCountry" ||
			name === "phone" ||
			name === "businessPostalCode" ||
			name === "postalCode" ||
			name === "complianceOfficerPhone" ||
			name === "registrationNumber" ||
			name === "tin"
		) {
			// Ensure phone fields and postal code remain as strings
			value = value.toString();
		} else if (!name.includes("[")) {
			// Try to parse JSON for non-array fields
			try {
				value = JSON.parse(value);
			} catch {
				// Keep as string if not valid JSON
			}
		}

		// Handle array notation (e.g., shareholders[0][firstName])
		if (name.includes("[")) {
			const parts = name.match(/([^\[\]]+)/g);
			let current = body;

			for (let i = 0; i < parts.length - 1; i++) {
				const part = parts[i];
				if (!(part in current)) {
					current[part] = !isNaN(parts[i + 1]) ? [] : {};
				}
				current = current[part];
			}

			const lastPart = parts[parts.length - 1];
			// Always keep these fields as strings
			if (
				lastPart.includes("phone") ||
				lastPart.includes("postcode") ||
				lastPart.includes("postalCode")
			) {
				current[lastPart] = value.toString();
			} else {
				try {
					current[lastPart] = JSON.parse(value);
				} catch {
					current[lastPart] = value;
				}
			}
		} else {
			body[name] = value;
		}
	});

	// Convert shareholders array from object to array if needed
	if (body.shareholders && !Array.isArray(body.shareholders)) {
		const shareholdersObj = body.shareholders;
		body.shareholders = Object.keys(shareholdersObj)
			.sort()
			.map((key) => shareholdersObj[key]);
	}

	try {
		// Verify CAPTCHA token
		if (!body.captchaToken) {
			throw createError({
				statusCode: 400,
				statusMessage: "CAPTCHA verification is required",
			});
		}

		const captchaVerification = await verifyCaptcha(body.captchaToken, event);

		if (!captchaVerification.success) {
			throw createError({
				statusCode: 400,
				statusMessage: "CAPTCHA verification failed",
			});
		}

		console.log("CAPTCHA verification successful for signup");

		// Validate the request body
		const { error, value } = schema.validate(body, {
			abortEarly: false,
			allowUnknown: true,
		});

		if (error) {
			console.error("Validation error:", error);
			throw createError({
				statusCode: 400,
				statusMessage: "Validation error",
				data: error.details,
			});
		}

		console.log("Creating company record");
		const { data: company, error: companyError } = await admin
			.from("companies")
			.insert([
				{
					company_name: body.companyName,
					trading_name: body.tradingName,
					registration_date: body.registrationDate,
					registration_number: body.registrationNumber,
					tin: body.tin,
					nature_of_business: body.natureOfBusiness,
					business_activities: body.businessActivities,
					funds_source: body.fundsSource,
					address: body.address,
					city: body.city,
					region: body.region,
					postal_code: body.postalCode,
					country: body.country,
					business_address: body.sameAddress
						? body.address
						: body.businessAddress,
					business_city: body.sameAddress ? body.city : body.businessCity,
					business_region: body.sameAddress ? body.region : body.businessRegion,
					business_postal_code: body.sameAddress
						? body.postalCode
						: body.businessPostalCode,
					business_country: body.sameAddress
						? body.country
						: body.businessCountry,
				},
			])
			.select()
			.single();

		if (companyError) {
			console.error("Company creation error:", companyError);
			throw createError({
				statusCode: 400,
				statusMessage:
					companyError.message || "Failed to create company record",
				data: companyError,
			});
		}
		console.log("Saved company");

		// 2. Create primary contact record
		console.log("Creating primary contact record");
		const { data: primaryContact, error: primaryContactError } = await admin
			.from("primary_contacts")
			.insert([
				{
					company_id: company.id,
					first_name: body.firstName,
					last_name: body.lastName,
					job_title: body.jobTitle,
					dialing_code: body.phoneCountry,
					phone: body.phone,
					email: body.email,
					telegram: body.telegram || null,
					slack: body.slack || null,
				},
			])
			.select()
			.single();

		if (primaryContactError) {
			console.error("Primary contact creation error:", primaryContactError);
			throw createError({
				statusCode: 400,
				statusMessage:
					primaryContactError.message ||
					"Failed to create primary contact record",
				data: primaryContactError,
			});
		}
		console.log("Saved primary contact");

		// 3. Create shareholders
		console.log("Creating shareholders");
		const shareholderPromises = body.shareholders.map(async (shareholder) => {
			const { data: shareholderData, error: shareholderError } = await admin
				.from("shareholders")
				.insert([
					{
						company_id: company.id,
						type: shareholder.type,
						percentage: shareholder.percentage,
						first_name: shareholder.firstName,
						last_name: shareholder.lastName,
						date_of_birth: shareholder.dob,
						nationality: shareholder.nationality,
						dual_citizen: shareholder.dualCitizen,
						second_nationality: shareholder.secondNationality,
						residence_country: shareholder.residenceCountry,
						address: shareholder.address,
						city: shareholder.city,
						region: shareholder.region,
						postcode: shareholder.postcode,
						company_name: shareholder.companyName,
						registration_number: shareholder.companyRegNumber,
						incorporation_country: shareholder.companyCountry,
						phone_country: shareholder.phoneCountry,
						phone: shareholder.phone,
						email: shareholder.email,
						website: shareholder.website,
					},
				])
				.select()
				.single();

			if (shareholderError) throw shareholderError;
			return shareholderData;
		});

		const shareholders = await Promise.all(shareholderPromises);
		console.log("Saved shareholders");

		// 4. Create due diligence record
		console.log("Creating due diligence record");
		const { data: dueDiligence, error: dueDiligenceError } = await admin
			.from("due_diligence")
			.insert([
				{
					company_id: company.id,
					aml_approved: body.amlApproved,
					aml_details: body.amlDetails,
					has_compliance_officer: body.hasComplianceOfficer,
					compliance_officer_name: body.complianceOfficerName,
					compliance_officer_phone: body.complianceOfficerPhone,
					compliance_officer_email: body.complianceOfficerEmail,
					has_fit_proper_test: body.hasFitProperTest,
					fit_proper_test_details: body.fitProperTestDetails,
					compliance_staff_count: body.complianceStaffCount,
					has_pep_policies: body.hasPepPolicies,
					has_record_keeping: body.hasRecordKeeping,
					has_global_aml_policies: body.hasGlobalAmlPolicies,
					has_customer_identification: body.hasCustomerIdentification,
					collects_business_info: body.collectsBusinessInfo,
					has_customer_review: body.hasCustomerReview,
					has_customer_records: body.hasCustomerRecords,
					has_transaction_assessment: body.hasTransactionAssessment,
					has_risk_assessment: body.hasRiskAssessment,
					has_suspicious_transaction_policies:
						body.hasSuspiciousTransactionPolicies,
					has_sanction_screening: body.hasSanctionScreening,
					sanction_screening_details: body.sanctionScreeningDetails,
					has_fraud_cases: body.hasFraudCases,
					fraud_action_taken: body.fraudActionTaken,
					has_reported_transactions: body.hasReportedTransactions,
					reported_transactions_details: body.reportedTransactionsDetails,
					has_monitoring_program: body.hasMonitoringProgram,
					monitoring_program_details: body.monitoringProgramDetails,
					provides_aml_training: body.providesAmlTraining,
					keeps_training_records: body.keepsTrainingRecords,
					communicates_aml_changes: body.communicatesAmlChanges,
					employs_third_parties: body.employsThirdParties,
					third_party_aml_training: body.thirdPartyAmlTraining,
					has_enhanced_due_diligence: body.hasEnhancedDueDiligence,
				},
			])
			.select()
			.single();

		if (dueDiligenceError) {
			console.error("Due diligence creation error:", dueDiligenceError);
			throw createError({
				statusCode: 400,
				statusMessage:
					dueDiligenceError.message || "Failed to create due diligence record",
				data: dueDiligenceError,
			});
		}
		console.log("Saved due diligence");

		// 5. Store bank accounts
		const bankAccountRecords = body.bankAccounts.map((account) => ({
			company_id: company.id,
			iban: account.iban || null,
			account_number: account.accountNumber || null,
		}));

		const { error: bankAccountError } = await admin
			.from("bank_accounts")
			.insert(bankAccountRecords);

		if (bankAccountError) throw bankAccountError;
		console.log("Saved bank accounts");

		// 6. Store PEP information
		if (body.isPep) {
			const pepRecords = body.pepDetails.map((pep) => ({
				company_id: company.id,
				name: pep.name,
				office: pep.office,
				country: pep.country,
			}));

			const { error: pepError } = await admin
				.from("pep_details")
				.insert(pepRecords);

			if (pepError) throw pepError;
			console.log("Saved PEP details");
		}

		// 7. Store data protection information
		const { error: dataProtectionError } = await admin
			.from("data_protection")
			.insert({
				company_id: company.id,
				holds_data_in_eu: body.holdsDataInEu,
				data_storage_details: body.dataStorageDetails,
				data_security_procedures: body.dataSecurityProcedures,
				data_protection_policy: body.dataProtectionPolicy,
				data_protection_registration: body.dataProtectionRegistration,
			});

		if (dataProtectionError) throw dataProtectionError;
		console.log("Saved data protection information");
		// Get shareholder IDs for the company
		const { data: sholders, error: shareholderError } = await admin
			.from("shareholders")
			.select("id, type")
			.eq("company_id", company.id);
		if (shareholderError) throw shareholderError;

		await email(
			body.email,
			"Digital ledgers sign up",
			"Thank you for signing up with Digital Ledgers. You will have access to your account once we have reviewed your documents. We will keep you updated on the progress."
		);

		return { success: true, company_id: company.id, shareholders: sholders };
	} catch (error) {
		console.error("Signup error:", error);

		// Return more specific error information for debugging
		let errorMessage =
			"Error during signup process. Please email support@digitaledgers.com";
		let statusCode = 400;

		// Check if it's a database error
		if (error.code) {
			switch (error.code) {
				case "23505": // Unique constraint violation
					errorMessage = "A record with this information already exists";
					break;
				case "23503": // Foreign key constraint violation
					errorMessage = "Invalid reference data provided";
					break;
				case "23502": // Not null constraint violation
					errorMessage = "Required field is missing";
					break;
				default:
					errorMessage = `Database error: ${error.message}`;
			}
		}
		// Check if it's a validation error (already handled above, but just in case)
		else if (error.details) {
			errorMessage = `Validation error: ${error.details.map((d) => d.message).join(", ")}`;
		}
		// Check if it's an email service error
		else if (error.message && error.message.includes("email")) {
			errorMessage =
				"Failed to send confirmation email. Registration may have succeeded.";
			statusCode = 500;
		}
		// Generic error with more details in development
		else if (error.message) {
			errorMessage = `${errorMessage} - ${error.message}`;
		}

		throw createError({
			statusCode: statusCode,
			statusMessage: errorMessage,
		});
	}
});

const schema = Joi.object({
	companyName: Joi.string().required().messages({
		"string.empty": "Company name is required.",
		"any.required": "Company name is required.",
	}),
	tradingName: Joi.string().allow("").optional(),
	registrationDate: Joi.date().required().messages({
		"date.base": "Registration date must be a valid date.",
		"any.required": "Registration date is required.",
	}),
	registrationNumber: Joi.string().required().messages({
		"string.empty": "Registration number is required.",
		"any.required": "Registration number is required.",
	}),
	tin: Joi.string().required().messages({
		"string.empty": "Tax identification number is required.",
		"any.required": "Tax identification number is required.",
	}),
	natureOfBusiness: Joi.string().required().messages({
		"string.empty": "Nature of business is required.",
		"any.required": "Nature of business is required.",
	}),
	businessActivities: Joi.array()
		.min(1)
		.items(
			Joi.object({
				value: Joi.string().required(),
				label: Joi.string().required(),
			})
		)
		.messages({
			"array.min": "At least one business activity must be selected.",
		}),
	fundsSource: Joi.array()
		.min(1)
		.items(
			Joi.object({
				value: Joi.string().required(),
				label: Joi.string().required(),
			})
		)
		.messages({
			"array.min": "At least one source of funds is required.",
		}),
	address: Joi.string().required().messages({
		"string.empty": "Address is required.",
	}),
	city: Joi.string().required().messages({
		"string.empty": "City is required.",
	}),
	region: Joi.string().required().messages({
		"string.empty": "Region is required.",
	}),
	postalCode: Joi.string().required().messages({
		"string.empty": "Postal code is required.",
	}),
	country: Joi.string().required().messages({
		"string.empty": "Country is required.",
	}),
	sameAddress: Joi.boolean(),
	businessAddress: Joi.when("sameAddress", {
		is: false,
		then: Joi.string().required().messages({
			"string.empty": "Business address is required.",
		}),
	}),
	businessCity: Joi.when("sameAddress", {
		is: false,
		then: Joi.string().required().messages({
			"string.empty": "Business city is required.",
		}),
	}),
	businessRegion: Joi.when("sameAddress", {
		is: false,
		then: Joi.string().required().messages({
			"string.empty": "Business region is required.",
		}),
	}),
	businessPostalCode: Joi.when("sameAddress", {
		is: false,
		then: Joi.string().required().messages({
			"string.empty": "Business postal code is required.",
		}),
	}),
	businessCountry: Joi.when("sameAddress", {
		is: false,
		then: Joi.string().required().messages({
			"string.empty": "Business country is required.",
		}),
	}),
	shareholders: Joi.array()
		.min(1)
		.items(
			Joi.object({
				type: Joi.string().valid("individual", "corporate").required(),
				sameAsSignatory: Joi.boolean(),
				percentage: Joi.number().min(0).max(100).required().messages({
					"number.base": "Percentage is required",
					"number.min": "Percentage must be between 0 and 100",
					"number.max": "Percentage must be between 0 and 100",
				}),
				firstName: Joi.when("type", {
					is: "individual",
					then: Joi.string().required().messages({
						"string.empty": "First name is required",
					}),
				}),
				lastName: Joi.when("type", {
					is: "individual",
					then: Joi.string().required().messages({
						"string.empty": "Last name is required",
					}),
				}),
				dob: Joi.when("type", {
					is: "individual",
					then: Joi.date().required().messages({
						"date.base": "Date of birth must be a valid date",
					}),
				}),
				nationality: Joi.when("type", {
					is: "individual",
					then: Joi.string().required().messages({
						"string.empty": "Nationality is required",
					}),
				}),
				dualCitizen: Joi.boolean(),
				secondNationality: Joi.when("dualCitizen", {
					is: true,
					then: Joi.string().required().messages({
						"string.empty":
							"Second nationality is required when dual citizenship is selected",
					}),
				}),
				residenceCountry: Joi.when("type", {
					is: "individual",
					then: Joi.string().required().messages({
						"string.empty": "Country of residence is required",
					}),
				}),
				address: Joi.when("type", {
					is: "individual",
					then: Joi.string().required().messages({
						"string.empty": "Address is required",
					}),
				}),
				city: Joi.when("type", {
					is: "individual",
					then: Joi.string().required().messages({
						"string.empty": "City is required",
					}),
				}),
				region: Joi.when("type", {
					is: "individual",
					then: Joi.string().required().messages({
						"string.empty": "Region is required",
					}),
				}),
				postcode: Joi.when("type", {
					is: "individual",
					then: Joi.string().required().messages({
						"string.empty": "Postal code is required",
					}),
				}),
				companyName: Joi.when("type", {
					is: "corporate",
					then: Joi.string().required().messages({
						"string.empty": "Company name is required",
					}),
				}),
				companyRegNumber: Joi.when("type", {
					is: "corporate",
					then: Joi.string().required().messages({
						"string.empty": "Registration number is required",
					}),
				}),
				companyCountry: Joi.when("type", {
					is: "corporate",
					then: Joi.string().required().messages({
						"string.empty": "Country of incorporation is required",
					}),
				}),
				phoneCountry: Joi.string().required().messages({
					"string.empty": "Phone country code is required",
				}),
				phone: Joi.string().required().messages({
					"string.empty": "Phone number is required",
				}),
				email: Joi.string()
					.email({ tlds: { allow: false } })
					.required()
					.messages({
						"string.empty": "Email is required",
						"string.email": "Please enter a valid email address",
					}),
				website: Joi.string().uri().allow("").messages({
					"string.uri": "Please enter a valid website URL",
				}),
			})
		)
		.required()
		.messages({
			"array.min": "At least one shareholder is required",
		}),
	firstName: Joi.string().required().messages({
		"string.empty": "First name is required",
	}),
	lastName: Joi.string().required().messages({
		"string.empty": "Last name is required",
	}),
	jobTitle: Joi.string().required().messages({
		"string.empty": "Job title is required",
	}),
	phoneCountry: Joi.string().required().messages({
		// Add this validation
		"string.empty": "Phone country code is required",
	}),
	phone: Joi.string().required().messages({
		"string.empty": "Phone number is required",
	}),
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.messages({
			"string.empty": "Email is required",
			"string.email": "Please enter a valid email address",
		}),
	telegram: Joi.string().allow(""),
	slack: Joi.string().allow(""),
	isPep: Joi.boolean().required(),
	pepDetails: Joi.when("isPep", {
		is: true,
		then: Joi.array()
			.min(1)
			.items(
				Joi.object({
					name: Joi.string().required().messages({
						"string.empty": "PEP name is required",
					}),
					office: Joi.string().required().messages({
						"string.empty": "Public office/relation is required",
					}),
					country: Joi.string().required().messages({
						"string.empty": "Country of public office is required",
					}),
				})
			)
			.messages({
				"array.min": "At least one PEP detail is required when PEP is selected",
			}),
	}),
	amlApproved: Joi.boolean().required(),
	amlDetails: Joi.string().allow(""),
	hasComplianceOfficer: Joi.boolean().required(),
	complianceOfficerName: Joi.when("hasComplianceOfficer", {
		is: true,
		then: Joi.string().required().messages({
			"string.empty": "Compliance officer name is required",
		}),
	}),
	complianceOfficerPhone: Joi.when("hasComplianceOfficer", {
		is: true,
		then: Joi.string().required().messages({
			"string.empty": "Compliance officer phone is required",
		}),
	}),
	complianceOfficerEmail: Joi.when("hasComplianceOfficer", {
		is: true,
		then: Joi.string()
			.email({ tlds: { allow: false } })
			.required()
			.messages({
				"string.empty": "Compliance officer email is required",
				"string.email": "Please enter a valid email address",
			}),
	}),
	hasFitProperTest: Joi.boolean().required(),
	fitProperTestDetails: Joi.when("hasFitProperTest", {
		is: true,
		then: Joi.string().required().messages({
			"string.empty": "Fit and proper test details are required",
		}),
	}),
	complianceStaffCount: Joi.number().allow(null),
	hasPepPolicies: Joi.boolean().required(),
	hasRecordKeeping: Joi.boolean().required(),
	hasGlobalAmlPolicies: Joi.boolean().required(),

	// Audits
	hasInternalAudit: Joi.boolean().required(),
	hasExternalAudit: Joi.boolean().required(),
	hasTaxAudit: Joi.boolean().required(),
	taxAuditResults: Joi.string().allow(""),

	// Risk Assessment
	hasRiskAssessment: Joi.boolean().required(),

	// Reportable Transactions
	hasSuspiciousTransactionPolicies: Joi.boolean().required(),
	hasSanctionScreening: Joi.boolean().required(),
	sanctionScreeningDetails: Joi.string().allow(""),
	hasFraudCases: Joi.boolean().required(),
	fraudActionTaken: Joi.string().allow(""),
	hasReportedTransactions: Joi.boolean().required(),
	reportedTransactionsDetails: Joi.string().allow(""),

	// Transaction Monitoring
	hasMonitoringProgram: Joi.boolean().required(),
	monitoringProgramDetails: Joi.string().allow(""),
	providesAmlTraining: Joi.boolean().required(),
	keepsTrainingRecords: Joi.boolean().required(),
	communicatesAmlChanges: Joi.boolean().required(),
	employsThirdParties: Joi.boolean().required(),
	thirdPartyAmlTraining: Joi.string().allow(""),

	// Data Protection
	holdsDataInEu: Joi.boolean().required(),
	dataStorageDetails: Joi.string().allow(""),
	dataSecurityProcedures: Joi.string().allow(""),
	dataProtectionPolicy: Joi.string().allow(""),
	dataProtectionRegistration: Joi.string().allow(""),

	// Add this with the other due diligence validations
	hasEnhancedDueDiligence: Joi.boolean().required(),
	// KYC and Due Diligence fields
	hasCustomerIdentification: Joi.boolean().required(),
	collectsBusinessInfo: Joi.boolean().required(),
	hasCustomerReview: Joi.boolean().required(),
	hasCustomerRecords: Joi.boolean().required(),
	hasTransactionAssessment: Joi.boolean().required(),
	bankAccounts: Joi.array()
		.min(1)
		.items(
			Joi.object({
				iban: Joi.string().required().messages({
					"string.empty": "IBAN is required",
				}),
				accountNumber: Joi.string().required().messages({
					"string.empty": "Account number is required",
				}),
			})
		)
		.messages({
			"array.min": "At least one bank account is required",
		}),
});
