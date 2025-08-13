import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const {
			company_id,
			shareholders,
			legal_documents,
			proof_of_address,
			audit_report,
			kyc_policy,
			same_address,
		} = body;

		if (!company_id) {
			throw createError({
				statusCode: 400,
				statusMessage: "Company ID is required",
			});
		}

		const supabase = serverSupabaseServiceRole(event);
		const config = useRuntimeConfig();

		// Determine bucket names based on environment
		const legalDocumentsBucket =
			config.environment === "prod" ? "legal_documents" : "legal-documents";
		const addressProofsBucket =
			config.environment === "prod" ? "address_proofs" : "address-proofs";
		const identityDocumentsBucket =
			config.environment === "prod"
				? "identity_documents"
				: "identity-documents";
		const auditReportsBucket =
			config.environment === "prod" ? "audit_reports" : "audit-reports";
		const companyPoliciesBucket =
			config.environment === "prod" ? "company_policies" : "company-policies";

		const uploadPromises = [];
		const dbInsertPromises = [];

		// Upload legal documents
		if (legal_documents?.length) {
			for (const doc of legal_documents) {
				if (doc.file_data && doc.file_name) {
					const path = `${company_id}/legal/${Date.now()}-${doc.file_name}`;

					// Convert base64 to buffer if needed
					let fileBuffer;
					if (typeof doc.file_data === "string") {
						// Remove data URL prefix if present
						const base64Data = doc.file_data.replace(/^data:[^;]+;base64,/, "");
						fileBuffer = Buffer.from(base64Data, "base64");
					} else {
						fileBuffer = doc.file_data;
					}

					const uploadPromise = supabase.storage
						.from(legalDocumentsBucket)
						.upload(path, fileBuffer, {
							contentType: doc.content_type || "application/octet-stream",
						})
						.then(async ({ data: fileData, error: fileError }) => {
							if (fileError) throw fileError;

							// Store document metadata in database
							const { data, error: dbError } = await supabase
								.from("company_documents")
								.insert({
									company_id: company_id,
									document_type: "legal_document",
									file_path: path,
									file_name: doc.file_name,
									document_category: doc.document_category,
								})
								.select();

							if (dbError) throw dbError;
							return data;
						});

					uploadPromises.push(uploadPromise);
				}
			}
		}

		// Upload proof of address documents (only if address is different)
		if (!same_address && proof_of_address?.length) {
			for (const doc of proof_of_address) {
				if (doc.file_data && doc.file_name) {
					const path = `${company_id}/address/${Date.now()}-${doc.file_name}`;

					let fileBuffer;
					if (typeof doc.file_data === "string") {
						const base64Data = doc.file_data.replace(/^data:[^;]+;base64,/, "");
						fileBuffer = Buffer.from(base64Data, "base64");
					} else {
						fileBuffer = doc.file_data;
					}

					const uploadPromise = supabase.storage
						.from(addressProofsBucket)
						.upload(path, fileBuffer, {
							contentType: doc.content_type || "application/octet-stream",
						})
						.then(async ({ data: fileData, error: fileError }) => {
							if (fileError) throw fileError;

							const { data, error: dbError } = await supabase
								.from("company_documents")
								.insert({
									company_id: company_id,
									document_type: "address_proof",
									file_path: path,
									file_name: doc.file_name,
									document_category: doc.document_category,
								})
								.select();

							if (dbError) throw dbError;
							return data;
						});

					uploadPromises.push(uploadPromise);
				}
			}
		}

		// Upload shareholder documents
		if (shareholders?.length) {
			for (const [shareholderIndex, shareholder] of shareholders.entries()) {
				if (shareholder.id) {
					// Upload corporate shareholder documents
					if (
						shareholder.type === "corporate" &&
						shareholder.company_docs?.length
					) {
						for (const doc of shareholder.company_docs) {
							if (doc.file_data && doc.file_name) {
								const path = `${company_id}/shareholders/${shareholderIndex}/company_docs/${Date.now()}-${doc.file_name}`;

								let fileBuffer;
								if (typeof doc.file_data === "string") {
									const base64Data = doc.file_data.replace(
										/^data:[^;]+;base64,/,
										""
									);
									fileBuffer = Buffer.from(base64Data, "base64");
								} else {
									fileBuffer = doc.file_data;
								}

								const uploadPromise = supabase.storage
									.from(identityDocumentsBucket)
									.upload(path, fileBuffer, {
										contentType: doc.content_type || "application/octet-stream",
									})
									.then(async ({ data: fileData, error: fileError }) => {
										if (fileError) throw fileError;

										const { data, error: dbError } = await supabase
											.from("shareholder_documents")
											.insert({
												shareholder_id: shareholder.id,
												document_type: "company_document",
												file_path: path,
												file_name: doc.file_name,
												document_category: doc.document_category,
											})
											.select();

										if (dbError) throw dbError;
										return data;
									});

								uploadPromises.push(uploadPromise);
							}
						}
					}

					// Upload individual shareholder documents
					if (
						shareholder.type === "individual" &&
						shareholder.id_documents?.length
					) {
						for (const doc of shareholder.id_documents) {
							if (doc.file_data && doc.file_name) {
								const path = `${company_id}/shareholders/${shareholderIndex}/id_docs/${Date.now()}-${doc.file_name}`;

								let fileBuffer;
								if (typeof doc.file_data === "string") {
									const base64Data = doc.file_data.replace(
										/^data:[^;]+;base64,/,
										""
									);
									fileBuffer = Buffer.from(base64Data, "base64");
								} else {
									fileBuffer = doc.file_data;
								}

								const uploadPromise = supabase.storage
									.from(identityDocumentsBucket)
									.upload(path, fileBuffer, {
										contentType: doc.content_type || "application/octet-stream",
									})
									.then(async ({ data: fileData, error: fileError }) => {
										if (fileError) throw fileError;

										const { data, error: dbError } = await supabase
											.from("shareholder_documents")
											.insert({
												shareholder_id: shareholder.id,
												document_type: "id_document",
												file_path: path,
												file_name: doc.file_name,
												document_category: doc.document_category,
											})
											.select();

										if (dbError) throw dbError;
										return data;
									});

								uploadPromises.push(uploadPromise);
							}
						}
					}
				}
			}
		}

		// Upload audit report if exists
		if (audit_report?.file_data && audit_report?.file_name) {
			const path = `${company_id}/audit/${Date.now()}-${audit_report.file_name}`;

			let fileBuffer;
			if (typeof audit_report.file_data === "string") {
				const base64Data = audit_report.file_data.replace(
					/^data:[^;]+;base64,/,
					""
				);
				fileBuffer = Buffer.from(base64Data, "base64");
			} else {
				fileBuffer = audit_report.file_data;
			}

			const uploadPromise = supabase.storage
				.from(auditReportsBucket)
				.upload(path, fileBuffer, {
					contentType: audit_report.content_type || "application/octet-stream",
				})
				.then(async ({ data: fileData, error: fileError }) => {
					if (fileError) throw fileError;

					const { data, error: dbError } = await supabase
						.from("company_documents")
						.insert({
							company_id: company_id,
							document_type: "audit_report",
							file_path: path,
							file_name: audit_report.file_name,
						})
						.select();

					if (dbError) throw dbError;
					return data;
				});

			uploadPromises.push(uploadPromise);
		}

		// Upload KYC policy if exists
		if (kyc_policy?.file_data && kyc_policy?.file_name) {
			const path = `${company_id}/kyc/${Date.now()}-${kyc_policy.file_name}`;

			let fileBuffer;
			if (typeof kyc_policy.file_data === "string") {
				const base64Data = kyc_policy.file_data.replace(
					/^data:[^;]+;base64,/,
					""
				);
				fileBuffer = Buffer.from(base64Data, "base64");
			} else {
				fileBuffer = kyc_policy.file_data;
			}

			const uploadPromise = supabase.storage
				.from(companyPoliciesBucket)
				.upload(path, fileBuffer, {
					contentType: kyc_policy.content_type || "application/octet-stream",
				})
				.then(async ({ data: fileData, error: fileError }) => {
					if (fileError) throw fileError;

					const { data, error: dbError } = await supabase
						.from("company_documents")
						.insert({
							company_id: company_id,
							document_type: "kyc_policy",
							file_path: path,
							file_name: kyc_policy.file_name,
						})
						.select();

					if (dbError) throw dbError;
					return data;
				});

			uploadPromises.push(uploadPromise);
		}

		// Wait for all uploads and database insertions to complete
		const results = await Promise.all(uploadPromises);

		return {
			success: true,
			message: "All documents uploaded and processed successfully",
			uploaded_count: results.length,
		};
	} catch (error) {
		console.error("Document upload error:", error);
		throw createError({
			statusCode: 500,
			statusMessage: error.message || "Failed to upload documents",
		});
	}
});
