<template>
   <form>
      <!--Detalles de Eisen -->
      <div class="space-y-4 md:space-y-6">
         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.eisenDetails.fields.bankAccounts.title')
               }}</span>
            </label>
            <div class="space-y-2">
               <div v-for="(account, index) in form.bankAccounts" :key="index"
                  class="flex flex-row gap-x-4 items-center">
                  <div class="basis-1/2">
                     <input type="text" v-model="account.iban"
                        :placeholder="$t('forms.signup.eisenDetails.fields.bankAccounts.ibanPlaceholder')"
                        class="input input-bordered w-full" />
                  </div>
                  <div class="basis-1/2">
                     <input type="text" v-model="account.accountNumber"
                        :placeholder="$t('forms.signup.eisenDetails.fields.bankAccounts.accountNumberPlaceholder')"
                        class="input input-bordered w-full" />
                  </div>
                  <button v-if="index > 0" @click="form.bankAccounts.splice(index, 1)" type="button"
                     class="btn btn-ghost btn-circle">
                     <Icon name="heroicons:x-mark" class="w-5 h-5 text-error" />
                  </button>
               </div>
               <button @click="form.bankAccounts.push({ iban: '', accountNumber: '' })" type="button"
                  class="btn btn-outline btn-primary btn-sm">
                  <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
                  {{ $t('forms.signup.eisenDetails.fields.bankAccounts.addAccount') }}
               </button>
            </div>
         </div>

         <div class="space-y-4 bg-base-200 p-4 rounded-lg">
            <div class="form-control">
               <label class=" cursor-pointer gap-4">
                  <div class="flex-1">
                     <p class="font-medium mb-1">{{ $t('forms.signup.eisenDetails.fields.terms.title') }}*</p>
                     <p class="text-sm">{{ $t('forms.signup.eisenDetails.fields.terms.description') }}</p>
                  </div>
                  <input v-model="form.confirmTerms" type="checkbox" class="checkbox" />
               </label>
            </div>

            <div class="form-control">
               <label class=" cursor-pointer gap-4">
                  <div class="flex-1">
                     <p class="font-medium mb-1">{{ $t('forms.signup.eisenDetails.fields.marketing.title') }}</p>
                     <p class="text-sm">{{ $t('forms.signup.eisenDetails.fields.marketing.description') }}</p>
                  </div>
                  <input v-model="form.agreeMarketing" type="checkbox" class="checkbox" />
               </label>
            </div>

            <div class="form-control">
               <label class=" cursor-pointer gap-4">
                  <div class="flex-1">
                     <p class="font-medium mb-1">{{ $t('forms.signup.eisenDetails.fields.riskDisclosure.title') }}*</p>
                     <p class="text-sm">{{ $t('forms.signup.eisenDetails.fields.riskDisclosure.description') }}</p>
                  </div>
                  <input v-model="form.confirmEMI" type="checkbox" class="checkbox" />
               </label>
            </div>

            <div class="form-control">
               <label class=" cursor-pointer gap-4">
                  <div class="flex-1">
                     <p class="font-medium mb-1">
                        <a href="https://digitaledgers.com/policy_es.html" target="_blank" rel="noopener noreferrer">{{
                           $t('forms.signup.eisenDetails.fields.privacy.title') }}*</a>
                     </p>
                     <p class="text-sm">{{ $t('forms.signup.eisenDetails.fields.privacy.description') }}</p>
                  </div>
                  <input v-model="form.confirmPrivacy" type="checkbox" class="checkbox" />
               </label>
            </div>

            <div class="form-control">
               <label class=" cursor-pointer gap-4">
                  <div class="flex-1">
                     <p class="font-medium mb-1">{{ $t('forms.signup.eisenDetails.fields.tradingFees.title') }}*</p>
                     <p class="text-sm">{{ $t('forms.signup.eisenDetails.fields.tradingFees.description') }}</p>
                  </div>
                  <input v-model="form.confirmProvider" type="checkbox" class="checkbox" />
               </label>
            </div>

            <div class="form-control">
               <label class=" cursor-pointer gap-4">
                  <div class="flex-1">
                     <p class="font-medium mb-1">{{ $t('forms.signup.eisenDetails.fields.signatory.title') }}*</p>
                     <p class="text-sm">{{ $t('forms.signup.eisenDetails.fields.signatory.description') }}</p>
                  </div>
                  <input v-model="form.confirmSignatory" type="checkbox" class="checkbox" />
               </label>
            </div>
         </div>

         <div class="space-y-2">
            <p v-for="error in responseHandler.error" :key="error" class="text-xs text-error">
               {{ error }}
            </p>
         </div>

         <!-- Cloudflare Turnstile CAPTCHA -->
         <div class="space-y-2">
            <div id="signup-turnstile-widget" class="flex justify-center"></div>
            <p v-if="captchaError" class="text-red-400 text-xs mt-1 flex items-center">
               <svg class="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                     d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                     clip-rule="evenodd" />
               </svg>
               {{ captchaError }}
            </p>
         </div>

         <div class="flex gap-4">
            <button @click="previousStep" type="button" class="btn btn-outline flex-1">{{
               $t('forms.signup.primaryContact.buttons.previous') }}</button>
            <button :disabled="isLoading || !captchaToken" type="button" @click="handleSignUp"
               class="btn btn-primary flex-1">
               <span v-if="isLoading">
                  <Icon name="svg-spinners:blocks-shuffle-3" class="w-5 h-5" />
               </span>
               <span v-else>{{ $t('forms.signup.eisenDetails.buttons.submit') }}</span>
            </button>
         </div>
      </div>
   </form>
</template>

<script setup>
import Joi from 'joi';
const isLoading = ref(false);
const captchaToken = ref(null);
const captchaError = ref(null);
let signupTurnstileWidget = null;

const step = useState('signupStep')

const form = useState('signupForm')

const responseHandler = ref({
   error: null,
   success: null,
})

const handleSignUp = async () => {
   isLoading.value = true;
   responseHandler.value.error = null
   responseHandler.value.success = null
   captchaError.value = null;

   // Validate CAPTCHA
   if (!captchaToken.value) {
      captchaError.value = 'Please complete the CAPTCHA verification';
      isLoading.value = false;
      return;
   }

   try {
      const validate = await validateStep();
      if (!validate) {
         isLoading.value = false;
         return;
      }

      // Create FormData with only non-file data
      const formData = new FormData()

      // Company Details
      formData.append('companyName', form.value.companyName)
      formData.append('tradingName', form.value.tradingName)
      formData.append('registrationDate', form.value.registrationDate)
      formData.append('registrationNumber', form.value.registrationNumber)
      formData.append('tin', form.value.tin)
      formData.append('natureOfBusiness', form.value.natureOfBusiness)
      formData.append('businessActivities', JSON.stringify(form.value.businessActivities))
      formData.append('fundsSource', JSON.stringify(form.value.fundsSource))

      // Instead of sending files, just send metadata about the files
      formData.append('legalDocuments', JSON.stringify(form.value.legalDocuments.map(doc => ({
         name: doc.name,
         type: doc.type
      }))))

      // Address Details
      formData.append('address', form.value.address)
      formData.append('city', form.value.city)
      formData.append('region', form.value.region)
      formData.append('postalCode', String(form.value.postalCode))
      formData.append('country', form.value.country)
      formData.append('sameAddress', form.value.sameAddress)
      formData.append('businessAddress', form.value.businessAddress)
      formData.append('businessCity', form.value.businessCity)
      formData.append('businessRegion', form.value.businessRegion)
      formData.append('businessPostalCode', form.value.businessPostalCode)
      formData.append('businessCountry', form.value.businessCountry)

      // Send metadata about proof of address files
      formData.append('proofOfAddress', JSON.stringify(form.value.proofOfAddress.map(doc => ({
         name: doc.name,
         type: doc.type
      }))))

      // Shareholders - send metadata without files
      const shareholdersData = form.value.shareholders.map(shareholder => {
         const shareholderData = { ...shareholder };

         // Replace file objects with metadata
         if (shareholderData.idDocuments) {
            shareholderData.idDocuments = shareholderData.idDocuments.map(doc => ({
               name: doc.name,
               type: doc.type
            }));
         }

         if (shareholderData.companyDocs) {
            shareholderData.companyDocs = shareholderData.companyDocs.map(doc => ({
               name: doc.name,
               type: doc.type
            }));
         }

         return shareholderData;
      });

      formData.append('shareholders', JSON.stringify(shareholdersData));

      // Contact Information
      formData.append('firstName', form.value.firstName)
      formData.append('lastName', form.value.lastName)
      formData.append('jobTitle', form.value.jobTitle)
      formData.append('phoneCountry', form.value.phoneCountry)
      formData.append('phone', form.value.phone)
      formData.append('email', form.value.email)
      formData.append('telegram', form.value.telegram)
      formData.append('slack', form.value.slack)

      // PEP Information
      formData.append('isPep', form.value.isPep)
      if (form.value.isPep) {
         formData.append('pepDetails', JSON.stringify(form.value.pepDetails))
      }

      // Due Diligence
      formData.append('amlApproved', form.value.amlApproved)
      formData.append('amlDetails', form.value.amlDetails)
      formData.append('hasComplianceOfficer', form.value.hasComplianceOfficer)
      formData.append('complianceOfficerName', form.value.complianceOfficerName)
      formData.append('complianceOfficerPhone', String(form.value.complianceOfficerPhone))
      formData.append('complianceOfficerEmail', form.value.complianceOfficerEmail)
      formData.append('hasFitProperTest', form.value.hasFitProperTest)
      formData.append('fitProperTestDetails', form.value.fitProperTestDetails)
      formData.append('complianceStaffCount', form.value.complianceStaffCount)
      formData.append('hasPepPolicies', form.value.hasPepPolicies)
      formData.append('hasRecordKeeping', form.value.hasRecordKeeping)
      formData.append('hasGlobalAmlPolicies', form.value.hasGlobalAmlPolicies)

      // Audits
      formData.append('hasInternalAudit', form.value.hasInternalAudit)
      formData.append('hasExternalAudit', form.value.hasExternalAudit)
      formData.append('hasTaxAudit', form.value.hasTaxAudit)
      formData.append('taxAuditResults', form.value.taxAuditResults)

      // Risk Assessment
      formData.append('hasRiskAssessment', form.value.hasRiskAssessment)
      formData.append('hasTransactionAssessment', form.value.hasTransactionAssessment)

      // Reportable Transactions
      formData.append('hasSuspiciousTransactionPolicies', form.value.hasSuspiciousTransactionPolicies)
      formData.append('hasSanctionScreening', form.value.hasSanctionScreening)
      formData.append('sanctionScreeningDetails', form.value.sanctionScreeningDetails)
      formData.append('hasFraudCases', form.value.hasFraudCases)
      formData.append('fraudActionTaken', form.value.fraudActionTaken)
      formData.append('hasReportedTransactions', form.value.hasReportedTransactions)
      formData.append('reportedTransactionsDetails', String(form.value.reportedTransactionsDetails))

      // Transaction Monitoring
      formData.append('hasMonitoringProgram', form.value.hasMonitoringProgram)
      formData.append('monitoringProgramDetails', form.value.monitoringProgramDetails)
      formData.append('providesAmlTraining', form.value.providesAmlTraining)
      formData.append('keepsTrainingRecords', form.value.keepsTrainingRecords)
      formData.append('communicatesAmlChanges', form.value.communicatesAmlChanges)
      formData.append('employsThirdParties', form.value.employsThirdParties)
      formData.append('thirdPartyAmlTraining', form.value.thirdPartyAmlTraining)

      // Data Protection
      formData.append('holdsDataInEu', form.value.holdsDataInEu)
      formData.append('dataStorageDetails', form.value.dataStorageDetails)
      formData.append('dataSecurityProcedures', form.value.dataSecurityProcedures)
      formData.append('dataProtectionPolicy', form.value.dataProtectionPolicy)
      formData.append('dataProtectionRegistration', form.value.dataProtectionRegistration)

      // Bank Accounts
      formData.append('bankAccounts', JSON.stringify(form.value.bankAccounts))

      // Add KYC and Due Diligence fields
      formData.append('hasEnhancedDueDiligence', form.value.hasEnhancedDueDiligence)
      formData.append('hasCustomerRecords', form.value.hasCustomerRecords)
      formData.append('hasCustomerReview', form.value.hasCustomerReview)
      formData.append('hasCustomerIdentification', form.value.hasCustomerIdentification)
      formData.append('collectsBusinessInfo', form.value.collectsBusinessInfo)

      // Add CAPTCHA token
      formData.append('captchaToken', captchaToken.value)

      // Send FormData to the backend
      const res = await $fetch('/api/signup', {
         method: 'POST',
         body: formData,
      })

      // After getting company_id, upload files
      if (res.success && res.company_id) {
         console.log("Uploading files for company:", res.company_id);
         await uploadFiles(res.company_id, res.shareholders);
         return navigateTo('/login')
      }

   } catch (error) {
      console.log("AN ERROR", error)
      if (error.details) {
         responseHandler.value.error = error.details.map((err) => err.message);
      } else {
         responseHandler.value.error = [error.message];
      }
      // Reset CAPTCHA on error
      resetSignupCaptcha();
   } finally {
      isLoading.value = false;
   }
}

// New function to handle file uploads after getting company_id
const uploadFiles = async (companyId, shareholders) => {
   const uploadPromises = [];
   const supabase = useSupabaseClient();
   const config = useRuntimeConfig();

   // Determine table names based on environment
   const legalDocumentsBucket = config.environment === 'prod' ? 'legal_documents' : 'legal-documents';
   const addressProofsBucket = config.environment === 'prod' ? 'address_proofs' : 'address-proofs';
   const identityDocumentsBucket = config.environment === 'prod' ? 'identity_documents' : 'identity-documents';
   const auditReportsBucket = config.environment === 'prod' ? 'audit_reports' : 'audit-reports';
   const companyDocumentsBucket = config.environment === 'prod' ? 'company_documents' : 'company-documents';
   const companyPoliciesBucket = config.environment === 'prod' ? 'company_policies' : 'company-policies';

   // Upload legal documents
   if (form.value.legalDocuments?.length) {
      for (const doc of form.value.legalDocuments) {
         const path = `${companyId}/legal/${Date.now()}-${doc.name}`;
         uploadPromises.push(
            supabase.storage
               .from(legalDocumentsBucket)
               .upload(path, doc.file)
               .then(async ({ data: fileData, error: fileError }) => {
                  if (fileError) throw fileError;

                  return supabase.from(companyDocumentsBucket).insert({
                     company_id: companyId,
                     document_type: "legal_document",
                     file_path: path,
                     file_name: doc.name,
                     document_category: doc.type,
                  });
               })
         );
      }
   }
   console.log("Stored legal documents");

   // Upload proof of address documents
   if (!form.value.sameAddress && form.value.proofOfAddress?.length) {
      for (const doc of form.value.proofOfAddress) {
         const path = `${companyId}/address/${Date.now()}-${doc.name}`;
         uploadPromises.push(
            supabase.storage
               .from(addressProofsBucket)
               .upload(path, doc.file)
               .then(async ({ data: fileData, error: fileError }) => {
                  if (fileError) throw fileError;

                  return supabase.from(companyDocumentsBucket).insert({
                     company_id: companyId,
                     document_type: "address_proof",
                     file_path: path,
                     file_name: doc.name,
                     document_category: doc.type,
                  });
               })
         );
      }
   }
   console.log("Stored proof of address documents");
   // Upload shareholder documents
   for (const [shareholderIndex, shareholder] of form.value.shareholders.entries()) {
      const savedShareholder = shareholders[shareholderIndex];

      if (savedShareholder) {
         // Upload corporate shareholder documents
         if (shareholder.type === 'corporate' && shareholder.companyDocs?.length) {
            for (const doc of shareholder.companyDocs) {
               const path = `${companyId}/shareholders/${shareholderIndex}/company_docs/${Date.now()}-${doc.name}`;
               uploadPromises.push(
                  supabase.storage
                     .from(identityDocumentsBucket)
                     .upload(path, doc.file)
                     .then(async ({ data: fileData, error: fileError }) => {
                        if (fileError) throw fileError;

                        return supabase.from("shareholder_documents").insert({
                           shareholder_id: savedShareholder.id,
                           document_type: "company_document",
                           file_path: path,
                           file_name: doc.name,
                           document_category: doc.type,
                        });
                     })
               );
            }
         }

         // Upload individual shareholder documents
         if (shareholder.type === 'individual' && shareholder.idDocuments?.length) {
            for (const doc of shareholder.idDocuments) {
               const path = `${companyId}/shareholders/${shareholderIndex}/id_docs/${Date.now()}-${doc.name}`;
               uploadPromises.push(
                  supabase.storage
                     .from(identityDocumentsBucket)
                     .upload(path, doc.file)
                     .then(async ({ data: fileData, error: fileError }) => {
                        if (fileError) throw fileError;

                        return supabase.from("shareholder_documents").insert({
                           shareholder_id: savedShareholder.id,
                           document_type: "id_document",
                           file_path: path,
                           file_name: doc.name,
                           document_category: doc.type,
                        });
                     })
               );
            }
         }
      }
   }
   console.log("Stored shareholder documents");
   // Upload audit report if exists
   if (form.value.auditReport?.file) {
      const path = `${companyId}/audit/${Date.now()}-${form.value.auditReport.name}`;
      uploadPromises.push(
         supabase.storage
            .from(auditReportsBucket)
            .upload(path, form.value.auditReport.file)
            .then(async ({ data: fileData, error: fileError }) => {
               if (fileError) throw fileError;

               return supabase.from(companyDocumentsBucket).insert({
                  company_id: companyId,
                  document_type: "audit_report",
                  file_path: path,
                  file_name: form.value.auditReport.name,
               });
            })
      );
   }
   console.log("Stored audit report");
   // Upload KYC policy if exists
   if (form.value.kycPolicy?.file) {
      const path = `${companyId}/kyc/${Date.now()}-${form.value.kycPolicy.name}`;
      uploadPromises.push(
         supabase.storage
            .from(companyPoliciesBucket)
            .upload(path, form.value.kycPolicy.file)
            .then(async ({ data: fileData, error: fileError }) => {
               if (fileError) throw fileError;

               return supabase.from(companyDocumentsBucket).insert({
                  company_id: companyId,
                  document_type: "kyc_policy",
                  file_path: path,
                  file_name: form.value.kycPolicy.name,
               });
            })
      );
   }
   console.log("Stored KYC policy");
   // Wait for all uploads to complete
   await Promise.all(uploadPromises);
   console.log("All files uploaded successfully");
}

async function validateStep() {
   const schema = Joi.object({
      bankAccounts: Joi.array().min(1).items(
         Joi.object({
            iban: Joi.string().required().messages({
               "string.empty": "IBAN is required"
            }),
            accountNumber: Joi.string().required().messages({
               "string.empty": "Account number is required"
            })
         })
      ).messages({
         "array.min": "At least one bank account is required"
      }),
      confirmTerms: Joi.boolean().valid(true).required().messages({
         "any.only": "You must accept the Terms and Conditions"
      }),
      agreeMarketing: Joi.boolean(),
      confirmEMI: Joi.boolean().valid(true).required().messages({
         "any.only": "You must confirm understanding of EMI operations"
      }),
      confirmPrivacy: Joi.boolean().valid(true).required().messages({
         "any.only": "You must accept the Privacy Policy"
      }),
      confirmProvider: Joi.boolean().valid(true).required().messages({
         "any.only": "You must acknowledge Digital as your service provider"
      }),
      confirmSignatory: Joi.boolean().valid(true).required().messages({
         "any.only": "You must confirm you are authorized signatory"
      })
   })


   // Extract the fields relevant to the current step from the form
   const fields = {
      bankAccounts: form.value.bankAccounts,
      confirmTerms: form.value.confirmTerms,
      agreeMarketing: form.value.agreeMarketing,
      confirmEMI: form.value.confirmEMI,
      confirmPrivacy: form.value.confirmPrivacy,
      confirmProvider: form.value.confirmProvider,
      confirmSignatory: form.value.confirmSignatory
   };

   // Validate only the fields of the current step
   const { error } = schema.validate(fields, {
      abortEarly: false,
   });

   if (error) {
      responseHandler.value.error = error.details.map((err) => err.message);
      return false; // Prevent moving to the next step
   }

   return true; // Allow moving to the next step
}

const previousStep = () => {
   responseHandler.value.error = null;
   responseHandler.value.success = null;
   step.value--;
};

// Initialize Cloudflare Turnstile CAPTCHA
const initializeSignupCaptcha = () => {
   const config = useRuntimeConfig();

   if (!config.public.cloudflareSiteKey) {
      console.error('Cloudflare Turnstile site key is not configured');
      captchaError.value = 'CAPTCHA configuration error. Please contact support.';
      return;
   }

   if (window.turnstile) {
      // Wait for DOM element to be available
      nextTick(() => {
         const container = document.getElementById('signup-turnstile-widget');
         if (container) {
            signupTurnstileWidget = window.turnstile.render(container, {
               sitekey: config.public.cloudflareSiteKey,
               callback: function (token) {
                  captchaToken.value = token;
                  captchaError.value = null;
               },
               'error-callback': function () {
                  captchaToken.value = null;
                  captchaError.value = 'CAPTCHA verification failed. Please try again.';
               },
               'expired-callback': function () {
                  captchaToken.value = null;
                  captchaError.value = 'CAPTCHA expired. Please verify again.';
               },
               theme: 'dark',
               size: 'normal',
            });
         } else {
            console.error('Signup Turnstile container element not found');
            captchaError.value = 'CAPTCHA widget could not be loaded.';
         }
      });
   }
};

// Reset CAPTCHA widget
const resetSignupCaptcha = () => {
   if (window.turnstile && signupTurnstileWidget !== null) {
      try {
         window.turnstile.reset(signupTurnstileWidget);
      } catch (error) {
         console.warn('Failed to reset signup CAPTCHA widget:', error);
         setTimeout(initializeSignupCaptcha, 100);
      }
   }
   captchaToken.value = null;
};

// Load Cloudflare Turnstile script
const loadSignupTurnstileScript = () => {
   if (document.querySelector('script[src*="turnstile"]')) {
      setTimeout(initializeSignupCaptcha, 100);
      return;
   }

   const script = document.createElement('script');
   script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
   script.async = true;
   script.defer = true;
   script.onload = () => {
      setTimeout(initializeSignupCaptcha, 100);
   };
   script.onerror = () => {
      console.error('Failed to load Cloudflare Turnstile script for signup');
      captchaError.value = 'Failed to load CAPTCHA. Please refresh the page.';
   };
   document.head.appendChild(script);
};

// Initialize CAPTCHA when step 6 (EisenDetails) is reached
watch(step, (newStep) => {
   if (newStep === 6) {
      nextTick(() => {
         loadSignupTurnstileScript();
      });
   }
}, { immediate: true });
</script>