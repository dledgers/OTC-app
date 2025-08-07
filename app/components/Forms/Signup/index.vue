<template>
   <div class="flex flex-col items-center justify-center h-full w-full">
      <NuxtLink to="/" class="flex items-center  text-2xl font-semibold">
         <img src="/logo.png" alt="logo">

      </NuxtLink>
      <div class="w-full bg-base-100 rounded-lg shadow sm:max-w-xl">
         <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div class="flex flex-row items-center w-full">
               <div class="flex justify-start">
                  <!-- <Icon v-if="step != 1" @click="previousStep" name="heroicons:arrow-left" class="cursor-pointer" /> -->
               </div>
               <div class="flex-grow text-center">
                  <h1 class="text-xl font-bold leading-tight tracking-tight md:text-2xl">
                     {{ formStep }}
                  </h1>
               </div>
            </div>
            <FormsSignupBusinessDetails v-if="step === 1" />
            <FormsSignupShareholderDetails v-if="step === 2" />
            <FormsSignupPrimaryContact v-if="step === 3" />
            <FormsSignupPepInformation v-if="step === 4" />
            <FormsSignupDueDiligence v-if="step === 5" />
            <FormsSignupEisenDetails v-if="step === 6" />
         </div>
      </div>
   </div>
</template>

<script setup>
const { t } = useI18n();

const step = useState('signupStep', () => 1);

const form = useState('signupForm', () => ({
   // Business details
   companyName: "",
   tradingName: "",
   registrationDate: null,
   registrationNumber: "",
   tin: "",
   natureOfBusiness: "",
   businessActivities: [],
   fundsSource: [], // Initialize as empty array instead of empty string
   legalDocuments: [],
   address: "",
   city: "",
   region: "",
   postalCode: "",
   country: "",
   sameAddress: true,
   businessAddress: "",
   businessCity: "",
   businessRegion: "",
   businessPostalCode: "",
   businessCountry: "",
   proofOfAddress: [],

   // Shareholders
   shareholders: [{
      type: 'individual',
      sameAsSignatory: false,
      percentage: '',
      firstName: '',
      lastName: '',
      dob: null,
      nationality: '',
      dualCitizen: false,
      secondNationality: '',
      residenceCountry: '',
      address: '',
      city: '',
      region: '',
      postcode: '',
      phoneCountry: 'ES',
      phone: '',
      email: '',
      website: '',
      idDocuments: [],
      companyName: '',
      companyRegNumber: '',
      companyCountry: '',
      companyDocs: []
   }],

   // Due Diligence
   // General AML Policies
   amlApproved: false,
   amlDetails: "",
   hasComplianceOfficer: false,
   complianceOfficerName: "",
   complianceOfficerPhone: "",
   complianceOfficerEmail: "",
   hasFitProperTest: false,
   fitProperTestDetails: "",
   complianceStaffCount: null,
   hasPepPolicies: false,
   hasRecordKeeping: false,
   hasGlobalAmlPolicies: false,
   kycPolicy: null,
   hasCustomerIdentification: false,
   collectsBusinessInfo: false,
   hasEnhancedDueDiligence: false,  // Add this line
   hasCustomerRecords: false,
   hasCustomerReview: false,  // Add this if it's missing

   // Audits
   hasInternalAudit: false,
   hasExternalAudit: false,
   auditReport: null,
   hasTaxAudit: false,
   taxAuditResults: "",

   // Risk Assessment
   hasRiskAssessment: false,
   riskAssessmentPolicy: null,
   hasTransactionAssessment: false,

   // Reportable Transactions
   hasSuspiciousTransactionPolicies: false,
   hasSanctionScreening: false,
   sanctionScreeningDetails: "",
   hasFraudCases: false,
   fraudActionTaken: "",
   hasReportedTransactions: false,
   reportedTransactionsDetails: "",

   // Transaction Monitoring
   hasMonitoringProgram: false,
   monitoringProgramDetails: "",
   providesAmlTraining: false,
   keepsTrainingRecords: false,
   communicatesAmlChanges: false,
   employsThirdParties: false,
   thirdPartyAmlTraining: "",

   // Data Protection
   holdsDataInEu: false,
   dataStorageDetails: "",
   dataSecurityProcedures: "",
   dataProtectionPolicy: "",
   dataProtectionRegistration: "",

   // Primary contact
   firstName: "",
   lastName: "",
   jobTitle: "",
   phoneCountry: "",  // Add this field
   phone: "",
   email: "",
   telegram: "",
   slack: "",

   // Eisen pay/Declaration
   bankAccounts: [{ iban: '', accountNumber: '' }],
   confirmTerms: false,
   agreeMarketing: false,
   confirmEMI: false,
   confirmPrivacy: false,
   confirmProvider: false,
   confirmSignatory: false,

   // PEP Information
   isPep: false,
   pepDetails: [{
      name: '',
      office: '',
      country: ''
   }],
}))

const formStep = computed(() => {
   switch (step.value) {
      case 1:
         return t('forms.signup.steps.companyProfile');
      case 2:
         return t('forms.signup.steps.beneficialOwners');
      case 3:
         return t('forms.signup.steps.primaryContact');
      case 4:
         return t('forms.signup.steps.pepInformation');
      case 5:
         return t('forms.signup.steps.dueDiligence');
      case 6:
         return t('forms.signup.steps.ibanStatement');
   }
});

const previousStep = () => {
   responseHandler.value.error = null;
   responseHandler.value.success = null;
   step.value--;
};
</script>