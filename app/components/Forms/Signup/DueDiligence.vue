<template>
   <form>
      <!--Due diligence -->
      <div class="space-y-4 md:space-y-6">
         <!-- Section 1: General AML Policies and Procedures -->
         <div class="text-center">
            <h3 class="text-lg font-medium text-primary">{{ $t('forms.signup.dueDiligence.sections.generalAml') }}</h3>
         </div>
         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.amlApproved.label')
               }}</span>
            </label>
            <div class="flex gap-4">
               <label class="label cursor-pointer justify-start gap-2">
                  <input v-model="form.amlApproved" type="radio" name="amlApproved" :value="true" class="radio" />
                  <span class="label-text">{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="label cursor-pointer justify-start gap-2">
                  <input v-model="form.amlApproved" type="radio" name="amlApproved" :value="false" class="radio" />
                  <span class="label-text">{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
            <div v-if="form.amlApproved" class="form-control w-full">
               <label class="label">
                  <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.amlDetails.label')
                  }}</span>
               </label>
               <textarea v-model="form.amlDetails" class="textarea textarea-bordered w-full h-32"
                  :placeholder="$t('forms.signup.dueDiligence.fields.amlDetails.placeholder')"></textarea>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.hasComplianceOfficer.label')
               }}</span>
            </label>
            <div class="flex gap-4">
               <label class="label cursor-pointer justify-start gap-2">
                  <input v-model="form.hasComplianceOfficer" type="radio" name="hasComplianceOfficer" :value="true"
                     class="radio" />
                  <span class="label-text">{{ $t('forms.signup.dueDiligence.fields.hasComplianceOfficer.options.yes')
                  }}</span>
               </label>
               <label class="label cursor-pointer justify-start gap-2">
                  <input v-model="form.hasComplianceOfficer" type="radio" name="hasComplianceOfficer" :value="false"
                     class="radio" />
                  <span class="label-text">{{ $t('forms.signup.dueDiligence.fields.hasComplianceOfficer.options.no')
                  }}</span>
               </label>
            </div>

            <div v-if="form.hasComplianceOfficer" class="space-y-4">
               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text font-medium">{{
                        $t('forms.signup.dueDiligence.fields.complianceOfficer.name.label') }}</span>
                  </label>
                  <input v-model="form.complianceOfficerName" type="text" class="input input-bordered w-full" />
               </div>

               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text font-medium">{{
                        $t('forms.signup.dueDiligence.fields.complianceOfficer.phone.label') }}</span>
                  </label>
                  <input v-model="form.complianceOfficerPhone" type="text" class="input input-bordered w-full" />
               </div>

               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text font-medium">{{
                        $t('forms.signup.dueDiligence.fields.complianceOfficer.email.label') }}</span>
                  </label>
                  <input v-model="form.complianceOfficerEmail" type="email" class="input input-bordered w-full" />
               </div>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.hasFitProperTest.label')
               }}</span>
            </label>
            <div class="flex gap-4">
               <label class="label cursor-pointer justify-start gap-2">
                  <input v-model="form.hasFitProperTest" type="radio" name="hasFitProperTest" :value="true"
                     class="radio" />
                  <span class="label-text">{{ $t('forms.signup.dueDiligence.fields.hasFitProperTest.options.yes')
                  }}</span>
               </label>
               <label class="label cursor-pointer justify-start gap-2">
                  <input v-model="form.hasFitProperTest" type="radio" name="hasFitProperTest" :value="false"
                     class="radio" />
                  <span class="label-text">{{ $t('forms.signup.dueDiligence.fields.hasFitProperTest.options.no')
                  }}</span>
               </label>
            </div>
         </div>

         <div v-if="form.hasFitProperTest" class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.fitProperTestDetails.label')
               }}</span>
            </label>
            <input v-model="form.fitProperTestDetails" type="text" class="input input-bordered w-full" />
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.complianceStaffCount.label')
               }}</span>
            </label>
            <input type="number" v-model="form.complianceStaffCount" class="input input-bordered" />
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.hasPepPolicies.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasPepPolicies" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasPepPolicies" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.hasRecordKeeping.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasRecordKeeping" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasRecordKeeping" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.hasGlobalAmlPolicies.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasGlobalAmlPolicies" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasGlobalAmlPolicies" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
         </div>

         <!-- Section 2: Audits -->
         <div class="divider"></div>

         <div class="text-center">
            <h3 class="text-lg font-medium text-primary">{{ $t('forms.signup.dueDiligence.sections.audits') }}</h3>
         </div>
         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.hasInternalAudit.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasInternalAudit" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasInternalAudit" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.hasExternalAudit.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasExternalAudit" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasExternalAudit" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>

            <div v-if="form.hasExternalAudit" class="form-control">
               <label class="label">
                  <span class="label-text">{{ $t('forms.signup.dueDiligence.fields.hasExternalAudit.uploadLabel')
                  }}</span>
               </label>
               <input type="file" @change="handleFileUpload($event, 'auditReport')"
                  class="file-input file-input-bordered w-full" />
               <div v-if="form.auditReport" class="text-sm mt-2">
                  {{ $t('forms.signup.dueDiligence.fileUpload.selectedFile', { fileName: form.auditReport.name }) }}
               </div>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.hasTaxAudit.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasTaxAudit" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasTaxAudit" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>

            <div v-if="form.hasTaxAudit" class="form-control">
               <label class="label">
                  <span class="label-text">{{ $t('forms.signup.dueDiligence.fields.hasTaxAudit.resultsLabel') }}</span>
               </label>
               <textarea v-model="form.taxAuditResults" class="textarea textarea-bordered h-32"></textarea>
            </div>
         </div>

         <!-- Section 3: Risk Assessment -->
         <div class="divider"></div>

         <div class="text-center">
            <h3 class="text-lg font-medium text-primary">{{ $t('forms.signup.dueDiligence.sections.riskAssessment') }}
            </h3>
         </div>
         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.hasRiskAssessment.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasRiskAssessment" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasRiskAssessment" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>

            <div v-if="form.hasRiskAssessment" class="form-control">
               <label class="label">
                  <span class="label-text">{{ $t('forms.signup.dueDiligence.fields.hasRiskAssessment.uploadLabel')
                  }}</span>
               </label>
               <input type="file" @change="handleFileUpload($event, 'riskAssessmentPolicy')"
                  class="file-input file-input-bordered w-full" />
               <div v-if="form.riskAssessmentPolicy" class="text-sm mt-2">
                  {{ $t('forms.signup.dueDiligence.fileUpload.selectedFile', {
                     fileName: form.riskAssessmentPolicy.name
                  }) }}
               </div>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{
                  $t('forms.signup.dueDiligence.fields.hasEnhancedDueDiligence.label') }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasEnhancedDueDiligence" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasEnhancedDueDiligence" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
         </div>

         <!-- Section 4: KYC, Due Diligence and Enhanced Due Diligence -->
         <div class="divider"></div>

         <div class="text-center">
            <h3 class="text-lg font-medium text-primary">{{ $t('forms.signup.dueDiligence.sections.kycDueDiligence') }}
            </h3>
         </div>
         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{
                  $t('forms.signup.dueDiligence.fields.hasCustomerIdentification.label') }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasCustomerIdentification" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasCustomerIdentification" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.collectsBusinessInfo.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.collectsBusinessInfo" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.collectsBusinessInfo" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.hasCustomerReview.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasCustomerReview" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasCustomerReview" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>

            <div v-if="form.hasCustomerReview" class="form-control">
               <label class="label">
                  <span class="label-text">{{ $t('forms.signup.dueDiligence.fields.hasCustomerReview.uploadLabel')
                  }}</span>
               </label>
               <input type="file" @change="handleFileUpload($event, 'kycPolicy')" accept=".pdf,.doc,.docx"
                  class="file-input file-input-bordered w-full" />
               <div v-if="form.kycPolicy" class="text-sm mt-2">
                  {{ $t('forms.signup.dueDiligence.fileUpload.selectedFile', { fileName: form.kycPolicy.name }) }}
               </div>
               <div class="text-xs text-error mt-1">
                  {{ $t('forms.signup.dueDiligence.fileUpload.fileTypes') }}
               </div>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.hasCustomerRecords.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasCustomerRecords" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasCustomerRecords" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{
                  $t('forms.signup.dueDiligence.fields.hasTransactionAssessment.label') }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" name="hasTransactionAssessment" v-model="form.hasTransactionAssessment"
                     :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" name="hasTransactionAssessment" v-model="form.hasTransactionAssessment"
                     :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
         </div>

         <!-- Section 5: Reportable Transactions -->
         <div class="divider"></div>

         <div class="text-center">
            <h3 class="text-lg font-medium text-primary">{{
               $t('forms.signup.dueDiligence.sections.reportableTransactions') }}</h3>
         </div>
         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{
                  $t('forms.signup.dueDiligence.fields.hasSuspiciousTransactionPolicies.label') }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasSuspiciousTransactionPolicies" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasSuspiciousTransactionPolicies" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.hasSanctionScreening.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasSanctionScreening" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasSanctionScreening" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>

            <div v-if="form.hasSanctionScreening" class="form-control">
               <label class="label">
                  <span class="label-text">{{ $t('forms.signup.dueDiligence.fields.hasSanctionScreening.detailsLabel')
                  }}</span>
               </label>
               <textarea v-model="form.sanctionScreeningDetails" class="textarea textarea-bordered h-32"></textarea>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.hasFraudCases.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasFraudCases" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasFraudCases" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>

            <div v-if="form.hasFraudCases" class="form-control">
               <label class="label">
                  <span class="label-text">{{ $t('forms.signup.dueDiligence.fields.hasFraudCases.actionLabel') }}</span>
               </label>
               <textarea v-model="form.fraudActionTaken" class="textarea textarea-bordered h-32"></textarea>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{
                  $t('forms.signup.dueDiligence.fields.hasReportedTransactions.label') }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasReportedTransactions" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasReportedTransactions" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>

            <div v-if="form.hasReportedTransactions" class="form-control">
               <label class="label">
                  <span class="label-text">{{
                     $t('forms.signup.dueDiligence.fields.hasReportedTransactions.detailsLabel') }}</span>
               </label>
               <textarea type="text" v-model="form.reportedTransactionsDetails"
                  class="textarea textarea-bordered h-32"></textarea>
            </div>
         </div>

         <!-- Section 6: Transaction Monitoring -->
         <div class="divider"></div>

         <div class="text-center">
            <h3 class="text-lg font-medium text-primary">{{
               $t('forms.signup.dueDiligence.sections.transactionMonitoring') }}</h3>
         </div>
         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.hasMonitoringProgram.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasMonitoringProgram" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.hasMonitoringProgram" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>

            <div v-if="form.hasMonitoringProgram" class="form-control">
               <label class="label">
                  <span class="label-text">{{ $t('forms.signup.dueDiligence.fields.hasMonitoringProgram.detailsLabel')
                  }}</span>
               </label>
               <textarea v-model="form.monitoringProgramDetails" class="textarea textarea-bordered h-32"></textarea>
            </div>
         </div>

         <!-- Section 7: AML Training -->
         <div class="divider"></div>

         <div class="text-center">
            <h3 class="text-lg font-medium text-primary">{{ $t('forms.signup.dueDiligence.sections.amlTraining') }}</h3>
         </div>
         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.providesAmlTraining.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.providesAmlTraining" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.providesAmlTraining" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.keepsTrainingRecords.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.keepsTrainingRecords" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.keepsTrainingRecords" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{
                  $t('forms.signup.dueDiligence.fields.communicatesAmlChanges.label') }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.communicatesAmlChanges" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.communicatesAmlChanges" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.employsThirdParties.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.employsThirdParties" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.employsThirdParties" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>

            <div v-if="form.employsThirdParties" class="form-control mt-4">
               <label class="label">
                  <span class="label-text font-medium">{{
                     $t('forms.signup.dueDiligence.fields.employsThirdParties.trainingLabel') }}</span>
               </label>
               <textarea v-model="form.thirdPartyAmlTraining"
                  :placeholder="$t('forms.signup.dueDiligence.fields.employsThirdParties.trainingPlaceholder')"
                  class="textarea textarea-bordered h-32"></textarea>
            </div>
         </div>

         <!-- Section 8: Data protection -->
         <div class="divider"></div>

         <div class="text-center">
            <h3 class="text-lg font-medium text-primary">{{ $t('forms.signup.dueDiligence.sections.dataProtection') }}
            </h3>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.holdsDataInEu.label')
               }}</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.holdsDataInEu" :value="true" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.yes') }}</span>
               </label>
               <label class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer">
                  <input type="radio" v-model="form.holdsDataInEu" :value="false" class="radio" />
                  <span>{{ $t('forms.signup.dueDiligence.fields.amlApproved.options.no') }}</span>
               </label>
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.dataStorageDetails.label')
               }}</span>
            </label>
            <textarea v-model="form.dataStorageDetails"
               :placeholder="$t('forms.signup.dueDiligence.fields.dataStorageDetails.placeholder')"
               class="textarea textarea-bordered h-32"></textarea>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{
                  $t('forms.signup.dueDiligence.fields.dataSecurityProcedures.label') }}</span>
            </label>
            <textarea v-model="form.dataSecurityProcedures"
               :placeholder="$t('forms.signup.dueDiligence.fields.dataSecurityProcedures.placeholder')"
               class="textarea textarea-bordered h-32"></textarea>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.dueDiligence.fields.dataProtectionPolicy.label')
               }}</span>
            </label>
            <textarea v-model="form.dataProtectionPolicy"
               :placeholder="$t('forms.signup.dueDiligence.fields.dataProtectionPolicy.placeholder')"
               class="textarea textarea-bordered h-32"></textarea>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{
                  $t('forms.signup.dueDiligence.fields.dataProtectionRegistration.label') }}</span>
            </label>
            <textarea v-model="form.dataProtectionRegistration"
               :placeholder="$t('forms.signup.dueDiligence.fields.dataProtectionRegistration.placeholder')"
               class="textarea textarea-bordered h-32"></textarea>
         </div>

         <div class="space-y-2">
            <p v-for="error in responseHandler.error" :key="error" class="text-xs text-error">
               *{{ error }}
            </p>
         </div>

         <div class="form-control w-full">
            <div class="flex gap-4">
               <button @click="previousStep" type="button" class="btn btn-outline flex-1">{{
                  $t('forms.signup.dueDiligence.buttons.previous') }}</button>
               <button @click="nextStep" type="button" class="btn btn-primary flex-1">{{
                  $t('forms.signup.dueDiligence.buttons.next') }}</button>
            </div>
         </div>
      </div>
   </form>
</template>

<script setup>
import Joi from 'joi';

const isLoading = ref(false);

const step = useState('signupStep')

const form = useState('signupForm', () => ({
   amlApproved: false,
   amlDetails: '',
   hasComplianceOfficer: false,
   complianceOfficerName: '',
   complianceOfficerPhone: '',
   complianceOfficerEmail: '',
   hasFitProperTest: false,
   fitProperTestDetails: '',
   complianceStaffCount: null,
   hasPepPolicies: false,
   hasRecordKeeping: false,
   hasGlobalAmlPolicies: false,
   hasInternalAudit: false,
   hasExternalAudit: false,
   auditReport: null,
   hasTaxAudit: false,
   taxAuditResults: '',
   hasRiskAssessment: false,
   riskAssessmentPolicy: null,
   hasEnhancedDueDiligence: false,
   hasCustomerIdentification: false,
   collectsBusinessInfo: false,
   hasCustomerReview: false,
   kycPolicy: null,
   hasCustomerRecords: false,
   hasTransactionAssessment: false,
   hasSuspiciousTransactionPolicies: false,
   hasSanctionScreening: false,
   sanctionScreeningDetails: '',
   hasFraudCases: false,
   fraudActionTaken: '',
   hasReportedTransactions: false,
   reportedTransactionsDetails: '',
   hasMonitoringProgram: false,
   monitoringProgramDetails: '',
   providesAmlTraining: false,
   keepsTrainingRecords: false,
   communicatesAmlChanges: false,
   employsThirdParties: false,
   thirdPartyAmlTraining: '',
   holdsDataInEu: false,
   dataStorageDetails: '',
   dataSecurityProcedures: '',
   dataProtectionPolicy: '',
   dataProtectionRegistration: ''
}))

const responseHandler = ref({
   error: null,
   success: null,
})

async function validateStep() {
   const schema = Joi.object({
      // Due Diligence
      amlApproved: Joi.boolean().required(),
      amlDetails: Joi.string().allow(""),
      hasComplianceOfficer: Joi.boolean().required(),
      complianceOfficerName: Joi.when('hasComplianceOfficer', {
         is: true,
         then: Joi.string().required().messages({
            "string.empty": "Compliance officer name is required"
         })
      }),
      complianceOfficerPhone: Joi.when('hasComplianceOfficer', {
         is: true,
         then: Joi.string().required().messages({
            "string.empty": "Compliance officer phone is required"
         })
      }),
      complianceOfficerEmail: Joi.when('hasComplianceOfficer', {
         is: true,
         then: Joi.string().email({ tlds: { allow: false } }).required().messages({
            "string.empty": "Compliance officer email is required",
            "string.email": "Please enter a valid email address"
         })
      }),
      hasFitProperTest: Joi.boolean().required(),
      fitProperTestDetails: Joi.when('hasFitProperTest', {
         is: true,
         then: Joi.string().required().messages({
            "string.empty": "Fit and proper test details are required"
         })
      }),
      complianceStaffCount: Joi.number().allow(null),
      hasPepPolicies: Joi.boolean().required(),
      hasRecordKeeping: Joi.boolean().required(),
      hasGlobalAmlPolicies: Joi.boolean().required(),

      // Audits
      hasInternalAudit: Joi.boolean().required(),
      hasExternalAudit: Joi.boolean().required(),
      auditReport: Joi.when('hasExternalAudit', {
         is: true,
         then: Joi.object().required().messages({
            'any.required': 'Audit report policy document is required when external audit is enabled'
         }),
         otherwise: Joi.allow(null)
      }),
      hasTaxAudit: Joi.boolean().required(),
      taxAuditResults: Joi.string().allow(''),

      // Risk Assessment
      hasRiskAssessment: Joi.boolean().required(),
      riskAssessmentPolicy: Joi.when('hasRiskAssessment', {
         is: true,
         then: Joi.object().required().messages({
            'any.required': 'Risk assessment policy document is required when risk assessment is enabled'
         }),
         otherwise: Joi.allow(null)
      }),
      hasTransactionAssessment: Joi.boolean().required(),

      // Reportable Transactions
      hasSuspiciousTransactionPolicies: Joi.boolean().required(),
      hasSanctionScreening: Joi.boolean().required(),
      sanctionScreeningDetails: Joi.string().allow(''),
      hasFraudCases: Joi.boolean().required(),
      fraudActionTaken: Joi.string().allow(''),
      hasReportedTransactions: Joi.boolean().required(),
      reportedTransactionsDetails: Joi.string().allow(''),

      // Transaction Monitoring
      hasMonitoringProgram: Joi.boolean().required(),
      monitoringProgramDetails: Joi.string().allow(''),
      providesAmlTraining: Joi.boolean().required(),
      keepsTrainingRecords: Joi.boolean().required(),
      communicatesAmlChanges: Joi.boolean().required(),
      employsThirdParties: Joi.boolean().required(),
      thirdPartyAmlTraining: Joi.string().allow(''),

      // Data Protection
      holdsDataInEu: Joi.boolean().required(),
      dataStorageDetails: Joi.string().allow(''),
      dataSecurityProcedures: Joi.string().allow(''),
      dataProtectionPolicy: Joi.string().allow(''),
      dataProtectionRegistration: Joi.string().allow(''),

      // Add this with the other due diligence validations
      hasEnhancedDueDiligence: Joi.boolean().required(),
      // KYC and Due Diligence fields
      hasCustomerIdentification: Joi.boolean().required(),
      collectsBusinessInfo: Joi.boolean().required(),
      hasCustomerReview: Joi.boolean().required(),
      kycPolicy: Joi.when('hasCustomerReview', {
         is: true,
         then: Joi.object().required().messages({
            'any.required': 'KYC Policy document is required when customer review is enabled'
         }),
         otherwise: Joi.allow(null)
      }),
      hasCustomerRecords: Joi.boolean().required()
   })

   // Extract the fields relevant to the current step from the form
   const fields = {
      // Due Diligence fields
      amlApproved: form.value.amlApproved,
      amlDetails: form.value.amlDetails,
      hasComplianceOfficer: form.value.hasComplianceOfficer,
      complianceOfficerName: form.value.complianceOfficerName,
      complianceOfficerPhone: form.value.complianceOfficerPhone,
      complianceOfficerEmail: form.value.complianceOfficerEmail,
      hasFitProperTest: form.value.hasFitProperTest,
      fitProperTestDetails: form.value.fitProperTestDetails,
      complianceStaffCount: form.value.complianceStaffCount,
      hasPepPolicies: form.value.hasPepPolicies,
      hasRecordKeeping: form.value.hasRecordKeeping,
      hasGlobalAmlPolicies: form.value.hasGlobalAmlPolicies,

      // Audits
      hasInternalAudit: form.value.hasInternalAudit,
      hasExternalAudit: form.value.hasExternalAudit,
      auditReport: form.value.auditReport,
      hasTaxAudit: form.value.hasTaxAudit,
      taxAuditResults: form.value.taxAuditResults,

      // Risk Assessment
      hasRiskAssessment: form.value.hasRiskAssessment,
      riskAssessmentPolicy: form.value.riskAssessmentPolicy,
      hasTransactionAssessment: form.value.hasTransactionAssessment,

      // Reportable Transactions
      hasSuspiciousTransactionPolicies: form.value.hasSuspiciousTransactionPolicies,
      hasSanctionScreening: form.value.hasSanctionScreening,
      sanctionScreeningDetails: form.value.sanctionScreeningDetails,
      hasFraudCases: form.value.hasFraudCases,
      fraudActionTaken: form.value.fraudActionTaken,
      hasReportedTransactions: form.value.hasReportedTransactions,
      reportedTransactionsDetails: form.value.reportedTransactionsDetails,

      // Transaction Monitoring
      hasMonitoringProgram: form.value.hasMonitoringProgram,
      monitoringProgramDetails: form.value.monitoringProgramDetails,
      providesAmlTraining: form.value.providesAmlTraining,
      keepsTrainingRecords: form.value.keepsTrainingRecords,
      communicatesAmlChanges: form.value.communicatesAmlChanges,
      employsThirdParties: form.value.employsThirdParties,
      thirdPartyAmlTraining: form.value.thirdPartyAmlTraining,

      // Data Protection
      holdsDataInEu: form.value.holdsDataInEu,
      dataStorageDetails: form.value.dataStorageDetails,
      dataSecurityProcedures: form.value.dataSecurityProcedures,
      dataProtectionPolicy: form.value.dataProtectionPolicy,
      dataProtectionRegistration: form.value.dataProtectionRegistration,

      // Add this with the other due diligence validations
      hasEnhancedDueDiligence: form.value.hasEnhancedDueDiligence,

      // KYC and Due Diligence fields
      hasCustomerIdentification: form.value.hasCustomerIdentification,
      collectsBusinessInfo: form.value.collectsBusinessInfo,
      hasCustomerReview: form.value.hasCustomerReview,
      kycPolicy: form.value.kycPolicy,
      hasCustomerRecords: form.value.hasCustomerRecords,
   }

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

const nextStep = async () => {
   responseHandler.value.error = null;
   responseHandler.value.success = null;
   if (await validateStep()) {
      step.value++; // Move to next step if validation passes
   }
};

const previousStep = () => {
   responseHandler.value.error = null;
   responseHandler.value.success = null;
   step.value--;
};

const handleFileUpload = (event, field, shareholderIndex = null) => {
   const files = event.target.files;
   if (!files.length) return;

   // For single file uploads (like auditReport)
   if (field === 'auditReport' || field === 'riskAssessmentPolicy') {
      form.value[field] = {
         file: files[0],
         name: files[0].name,
         type: field
      };
      return;
   }

   // For multiple file uploads (like legalDocuments, proofOfAddress)
   if (field === 'legalDocuments' || field === 'proofOfAddress') {
      Array.from(files).forEach(file => {
         form.value[field].push({
            file: file,
            name: file.name,
            type: ''
         });
      });
      return;
   }

   // For shareholder documents
   if (shareholderIndex !== null) {
      Array.from(files).forEach(file => {
         if (!form.value.shareholders[shareholderIndex][field]) {
            form.value.shareholders[shareholderIndex][field] = [];
         }
         form.value.shareholders[shareholderIndex][field].push({
            file: file,
            name: file.name,
            type: ''
         });
      });
   }

   if (field === 'kycPolicy') {
      const file = event.target.files[0];
      if (file) {
         form.value.kycPolicy = {
            file: file,
            name: file.name,
            type: 'kyc_policy'
         };
      }
   }
};
</script>