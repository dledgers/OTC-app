<template>
   <form>
      <!--Business details-->
      <div class="space-y-6 md:space-y-8">
         <div class="text-center">
            <h3 class="text-lg font-medium text-primary">{{ $t('forms.signup.businessDetails.title') }}</h3>
            <div class="mt-1 text-sm text-gray-500">{{ $t('forms.signup.businessDetails.subtitle') }}</div>
         </div>

         <div class="space-y-4">
            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text font-medium">{{ $t('forms.signup.businessDetails.fields.companyName.label')
                  }}</span>
               </label>
               <input v-model="form.companyName" type="text"
                  :placeholder="$t('forms.signup.businessDetails.fields.companyName.placeholder')"
                  class="input input-bordered w-full" />
            </div>

            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text font-medium">{{ $t('forms.signup.businessDetails.fields.tradingName.label')
                  }}</span>
               </label>
               <input v-model="form.tradingName" type="text"
                  :placeholder="$t('forms.signup.businessDetails.fields.tradingName.placeholder')"
                  class="input input-bordered w-full" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text font-medium">{{
                        $t('forms.signup.businessDetails.fields.registrationDate.label') }}</span>
                  </label>
                  <input v-model="form.registrationDate" type="date" class="input input-bordered w-full" />
               </div>

               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text font-medium">{{
                        $t('forms.signup.businessDetails.fields.registrationNumber.label') }}</span>
                  </label>
                  <input v-model="form.registrationNumber" type="text"
                     :placeholder="$t('forms.signup.businessDetails.fields.registrationNumber.placeholder')"
                     class="input input-bordered w-full" />
               </div>
            </div>

            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text font-medium">{{ $t('forms.signup.businessDetails.fields.tin.label') }}</span>
               </label>
               <input v-model="form.tin" type="text"
                  :placeholder="$t('forms.signup.businessDetails.fields.tin.placeholder')"
                  class="input input-bordered w-full" />
            </div>

            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text font-bold">{{
                     $t('forms.signup.businessDetails.fields.businessActivities.title') }}</span>
               </label>
               <div class="text-sm text-gray-600 mb-2">
                  {{ $t('forms.signup.businessDetails.fields.businessActivities.description') }}
               </div>

               <div class="form-control w-full mb-4">
                  <label class="label">
                     <span class="label-text font-medium">{{
                        $t('forms.signup.businessDetails.fields.businessActivities.natureOfBusiness.label') }}</span>
                  </label>
                  <textarea v-model="form.natureOfBusiness" class="textarea textarea-bordered w-full h-32"
                     maxlength="2000"
                     :placeholder="$t('forms.signup.businessDetails.fields.businessActivities.natureOfBusiness.placeholder')"></textarea>
               </div>

               <!-- Display selected business activities -->
               <div class="mb-4 flex flex-wrap gap-2">
                  <div v-for="activity in form.businessActivities" :key="activity.value"
                     class="badge badge-primary gap-2">
                     {{ activity.label }}
                     <button @click="removeBusinessActivity(activity)" class="btn btn-ghost btn-xs">
                        <Icon name="heroicons:x-mark" class="w-4 h-4" />
                     </button>
                  </div>
               </div>

               <!-- Business activity selector -->
               <label class="label">
                  <span class="label-text font-medium">{{
                     $t('forms.signup.businessDetails.fields.businessActivities.purpose.label') }}</span>
               </label>
               <select @change="addBusinessActivity($event)" class="select select-bordered w-full">
                  <option value="" disabled selected>{{
                     $t('forms.signup.businessDetails.fields.businessActivities.purpose.placeholder') }}</option>
                  <optgroup
                     :label="$t('forms.signup.businessDetails.fields.businessActivities.purpose.groups.cryptoAndPayments.label')">
                     <option value="CRYPTO_ACCEPT">{{
                        $t('forms.signup.businessDetails.fields.businessActivities.purpose.groups.cryptoAndPayments.options.cryptoAccept')
                     }}</option>
                     <option value="PAYMENT_OPS">{{
                        $t('forms.signup.businessDetails.fields.businessActivities.purpose.groups.cryptoAndPayments.options.paymentOps')
                     }}</option>
                     <option value="CONVERT">{{
                        $t('forms.signup.businessDetails.fields.businessActivities.purpose.groups.cryptoAndPayments.options.convert')
                     }}</option>
                     <option value="ICO_LIQUIDITY">{{
                        $t('forms.signup.businessDetails.fields.businessActivities.purpose.groups.cryptoAndPayments.options.icoLiquidity')
                     }}</option>
                     <option value="OTC">{{
                        $t('forms.signup.businessDetails.fields.businessActivities.purpose.groups.cryptoAndPayments.options.otc')
                     }}</option>
                     <option value="CLIENT_TRADING">{{
                        $t('forms.signup.businessDetails.fields.businessActivities.purpose.groups.cryptoAndPayments.options.clientTrading')
                     }}</option>
                     <option value="PROP_TRADING">{{
                        $t('forms.signup.businessDetails.fields.businessActivities.purpose.groups.cryptoAndPayments.options.propTrading')
                     }}</option>
                  </optgroup>
               </select>
            </div>

            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text font-medium">{{ $t('forms.signup.businessDetails.fields.fundsSource.title')
                     }}</span>
               </label>

               <!-- Display selected fund sources -->
               <div class="mb-4 flex flex-wrap gap-2">
                  <div v-for="source in form.fundsSource" :key="source.value" class="badge badge-primary gap-2">
                     {{ source.label }}
                     <button @click="removeFundSource(source)" class="btn btn-ghost btn-xs">
                        <Icon name="heroicons:x-mark" class="w-4 h-4" />
                     </button>
                  </div>
               </div>

               <!-- Fund source selector -->
               <select @change="addFundSource($event)" class="select select-bordered w-full">
                  <option value="" disabled selected>{{
                     $t('forms.signup.businessDetails.fields.fundsSource.placeholder') }}</option>
                  <option value="company_income">{{
                     $t('forms.signup.businessDetails.fields.fundsSource.options.company_income') }}</option>
                  <option value="customer_funds">{{
                     $t('forms.signup.businessDetails.fields.fundsSource.options.customer_funds') }}</option>
                  <option value="earned_personal">{{
                     $t('forms.signup.businessDetails.fields.fundsSource.options.earned_personal') }}</option>
                  <option value="shares_sale">{{
                     $t('forms.signup.businessDetails.fields.fundsSource.options.shares_sale') }}</option>
                  <option value="investments">{{
                     $t('forms.signup.businessDetails.fields.fundsSource.options.investments') }}</option>
                  <option value="property_sale">{{
                     $t('forms.signup.businessDetails.fields.fundsSource.options.property_sale') }}</option>
                  <option value="ownership">{{ $t('forms.signup.businessDetails.fields.fundsSource.options.ownership')
                     }}</option>
                  <option value="equity_sale">{{
                     $t('forms.signup.businessDetails.fields.fundsSource.options.equity_sale') }}</option>
                  <option value="loan_proceeds">{{
                     $t('forms.signup.businessDetails.fields.fundsSource.options.loan_proceeds') }}</option>
                  <option value="other">{{ $t('forms.signup.businessDetails.fields.fundsSource.options.other') }}
                  </option>
               </select>
            </div>

            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text font-medium">{{ $t('forms.signup.businessDetails.fields.legalDocuments.title')
                     }}</span>
                  <span class="label-text-alt text-gray-500">{{
                     $t('forms.signup.businessDetails.fields.legalDocuments.maxSize') }}</span>
               </label>
               <div class="space-y-4">
                  <div v-for="(file, index) in form.legalDocuments" :key="file.name + index"
                     class="flex gap-4 items-center bg-base-200 p-3 rounded-lg">
                     <div class="grow">
                        <input type="text" :value="file.name" disabled class="input input-bordered w-full" />
                     </div>
                     <div class="w-72">
                        <select v-model="file.type" class="select select-bordered w-full">
                           <option value="">{{ $t('forms.signup.businessDetails.fields.legalDocuments.placeholder') }}
                           </option>
                           <option value="bank_statement">{{
                              $t('forms.signup.businessDetails.fields.legalDocuments.options.bank_statement') }}
                           </option>
                           <option value="business_description">{{
                              $t('forms.signup.businessDetails.fields.legalDocuments.options.business_description') }}
                           </option>
                           <option value="certificate_incorporation">{{
                              $t('forms.signup.businessDetails.fields.legalDocuments.options.certificate_incorporation')
                              }}</option>
                           <option value="memorandum">{{
                              $t('forms.signup.businessDetails.fields.legalDocuments.options.memorandum') }}</option>
                           <option value="articles">{{
                              $t('forms.signup.businessDetails.fields.legalDocuments.options.articles') }}</option>
                           <option value="good_standing">{{
                              $t('forms.signup.businessDetails.fields.legalDocuments.options.good_standing') }}</option>
                           <option value="power_attorney">{{
                              $t('forms.signup.businessDetails.fields.legalDocuments.options.power_attorney') }}
                           </option>
                           <option value="declaration_trust">{{
                              $t('forms.signup.businessDetails.fields.legalDocuments.options.declaration_trust') }}
                           </option>
                           <option value="other">{{
                              $t('forms.signup.businessDetails.fields.legalDocuments.options.other') }}</option>
                        </select>
                     </div>
                     <button @click="form.legalDocuments.splice(index, 1)"
                        class="btn btn-ghost btn-circle hover:bg-error/20">
                        <Icon name="heroicons:x-mark" class="w-6 h-6" />
                     </button>
                  </div>
               </div>
               <input type="file" @change="handleFileUpload($event, 'legalDocuments')"
                  class="file-input file-input-bordered w-full" multiple />
            </div>

            <div class="divider"></div>

            <div class="text-center">
               <h3 class="text-lg font-medium text-primary">{{
                  $t('forms.signup.businessDetails.fields.registeredOffice.title') }}</h3>
            </div>

            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text font-medium">{{
                     $t('forms.signup.businessDetails.fields.registeredOffice.address') }}</span>
               </label>
               <input v-model="form.address" type="text" class="input input-bordered w-full" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text font-medium">{{
                        $t('forms.signup.businessDetails.fields.registeredOffice.city') }}</span>
                  </label>
                  <input v-model="form.city" type="text" class="input input-bordered w-full" />
               </div>
               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text font-medium">{{
                        $t('forms.signup.businessDetails.fields.registeredOffice.region') }}</span>
                  </label>
                  <input v-model="form.region" type="text" class="input input-bordered w-full" />
               </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text font-medium">{{
                        $t('forms.signup.businessDetails.fields.registeredOffice.postalCode') }}</span>
                  </label>
                  <input v-model="form.postalCode" type="text" class="input input-bordered w-full" />
               </div>
               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text font-medium">{{
                        $t('forms.signup.businessDetails.fields.registeredOffice.country') }}</span>
                  </label>
                  <input v-model="form.country" type="text" class="input input-bordered w-full" />
               </div>
            </div>

            <div class="divider"></div>

            <div class="text-center">
               <h3 class="text-lg font-medium text-primary">{{
                  $t('forms.signup.businessDetails.fields.businessLocation.title') }}</h3>
            </div>

            <div class="form-control bg-base-200 p-4 rounded-lg">
               <label class="label cursor-pointer justify-start gap-4">
                  <input v-model="form.sameAddress" type="checkbox" class="toggle"
                     @change="() => console.log('sameAddress changed:', form.sameAddress)" />
                  <span class="label-text font-medium">{{
                     $t('forms.signup.businessDetails.fields.businessLocation.sameAddress') }}</span>
               </label>
            </div>

            <div v-if="!form.sameAddress" class="space-y-4">
               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text font-medium">{{
                        $t('forms.signup.businessDetails.fields.businessLocation.address') }}</span>
                  </label>
                  <input v-model="form.businessAddress" type="text" class="input input-bordered w-full" />
               </div>

               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-control w-full">
                     <label class="label">
                        <span class="label-text font-medium">{{
                           $t('forms.signup.businessDetails.fields.businessLocation.city') }}</span>
                     </label>
                     <input v-model="form.businessCity" type="text" class="input input-bordered w-full" />
                  </div>
                  <div class="form-control w-full">
                     <label class="label">
                        <span class="label-text font-medium">{{
                           $t('forms.signup.businessDetails.fields.businessLocation.region') }}</span>
                     </label>
                     <input v-model="form.businessRegion" type="text" class="input input-bordered w-full" />
                  </div>
               </div>

               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-control w-full">
                     <label class="label">
                        <span class="label-text font-medium">{{
                           $t('forms.signup.businessDetails.fields.businessLocation.postalCode') }}</span>
                     </label>
                     <input v-model="form.businessPostalCode" type="text" class="input input-bordered w-full" />
                  </div>
                  <div class="form-control w-full">
                     <label class="label">
                        <span class="label-text font-medium">{{
                           $t('forms.signup.businessDetails.fields.businessLocation.country') }}</span>
                     </label>
                     <input v-model="form.businessCountry" type="text" class="input input-bordered w-full" />
                  </div>
               </div>

               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text font-medium">{{
                        $t('forms.signup.businessDetails.fields.businessLocation.proofOfAddress.title') }}</span>
                     <span class="label-text-alt text-gray-500">{{
                        $t('forms.signup.businessDetails.fields.businessLocation.proofOfAddress.maxSize') }}</span>
                  </label>
                  <div class="space-y-4">
                     <div v-for="(file, index) in form.proofOfAddress" :key="file.name + index"
                        class="flex gap-4 items-center bg-base-200 p-3 rounded-lg">
                        <div class="grow">
                           <input type="text" :value="file.name" disabled class="input input-bordered w-full" />
                        </div>
                        <div class="w-72">
                           <select v-model="file.type" class="select select-bordered w-full">
                              <option value="">{{
                                 $t('forms.signup.businessDetails.fields.businessLocation.proofOfAddress.placeholder')
                                 }}</option>
                              <option value="utility_bill">{{
                                 $t('forms.signup.businessDetails.fields.businessLocation.proofOfAddress.options.utility_bill')
                                 }}</option>
                              <option value="bank_statement">{{
                                 $t('forms.signup.businessDetails.fields.businessLocation.proofOfAddress.options.bank_statement')
                                 }}</option>
                              <option value="lease_agreement">{{
                                 $t('forms.signup.businessDetails.fields.businessLocation.proofOfAddress.options.lease_agreement')
                                 }}</option>
                              <option value="tax_document">{{
                                 $t('forms.signup.businessDetails.fields.businessLocation.proofOfAddress.options.tax_document')
                                 }}</option>
                              <option value="other">{{
                                 $t('forms.signup.businessDetails.fields.businessLocation.proofOfAddress.options.other')
                                 }}</option>
                           </select>
                        </div>
                        <button @click="form.proofOfAddress.splice(index, 1)"
                           class="btn btn-ghost btn-circle hover:bg-error/20">
                           <Icon name="heroicons:x-mark" class="w-6 h-6" />
                        </button>
                     </div>
                  </div>
                  <input type="file" @change="handleFileUpload($event, 'proofOfAddress')"
                     class="file-input file-input-bordered w-full" multiple />
               </div>
            </div>

            <div class="space-y-2">
               <p v-for="error in responseHandler.error" :key="error" class="text-xs text-error">
                  *{{ error }}
               </p>
            </div>

            <button @click="nextStep" type="button"
               class="btn btn-primary w-full hover:bg-primary-focus transition-colors">{{
                  $t('forms.signup.primaryContact.buttons.next') }}</button>
         </div>
      </div>
   </form>
</template>

<script setup>
import Joi from 'joi';
import countries from '../country-name.json'
import phones from '../phone-code.json'

const isLoading = ref(false);
const selectedCountry = ref('ES');
const phoneCodes = ref(null);
const sortedCountries = ref(null);
const sortedPhoneCodes = ref(null);
const step = useState('signupStep')

const form = useState('signupForm')

const responseHandler = ref({
   error: null,
   success: null,
})

async function validateStep() {
   const schema = Joi.object({
      companyName: Joi.string().required().messages({
         "string.empty": "Company name is required.",
         "any.required": "Company name is required.",
      }),
      tradingName: Joi.string().allow('').optional(),
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
      businessActivities: Joi.array().min(1).items(
         Joi.object({
            value: Joi.string().required(),
            label: Joi.string().required()
         })
      ).messages({
         "array.min": "At least one business activity must be selected.",
      }),
      fundsSource: Joi.array().min(1).items(
         Joi.object({
            value: Joi.string().required(),
            label: Joi.string().required()
         })
      ).messages({
         "array.min": "At least one source of funds is required.",
      }),
      legalDocuments: Joi.array().min(1).items(
         Joi.object({
            file: Joi.any().required(),
            name: Joi.string().required(),
            type: Joi.string().required().messages({
               "string.empty": "Document type must be selected.",
            })
         })
      ).messages({
         "array.min": "At least one legal document is required.",
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
      businessAddress: Joi.when('sameAddress', {
         is: false,
         then: Joi.string().required().messages({
            "string.empty": "Business address is required.",
         })
      }),
      businessCity: Joi.when('sameAddress', {
         is: false,
         then: Joi.string().required().messages({
            "string.empty": "Business city is required.",
         })
      }),
      businessRegion: Joi.when('sameAddress', {
         is: false,
         then: Joi.string().required().messages({
            "string.empty": "Business region is required.",
         })
      }),
      businessPostalCode: Joi.when('sameAddress', {
         is: false,
         then: Joi.string().required().messages({
            "string.empty": "Business postal code is required.",
         })
      }),
      businessCountry: Joi.when('sameAddress', {
         is: false,
         then: Joi.string().required().messages({
            "string.empty": "Business country is required.",
         })
      }),
      proofOfAddress: Joi.when('sameAddress', {
         is: false,
         then: Joi.array().min(1).items(
            Joi.object({
               file: Joi.any().required(),
               name: Joi.string().required(),
               type: Joi.string().required().messages({
                  "string.empty": "Document type must be selected.",
               })
            })
         ).messages({
            "array.min": "At least one proof of address document is required.",
         })
      })
   });

   // Extract the fields relevant to the current step from the form
   const fields = {
      companyName: form.value.companyName,
      tradingName: form.value.tradingName,
      registrationDate: form.value.registrationDate,
      registrationNumber: form.value.registrationNumber,
      tin: form.value.tin,
      natureOfBusiness: form.value.natureOfBusiness,
      businessActivities: form.value.businessActivities,
      fundsSource: form.value.fundsSource,
      legalDocuments: form.value.legalDocuments,
      address: form.value.address,
      city: form.value.city,
      region: form.value.region,
      postalCode: form.value.postalCode,
      country: form.value.country,
      sameAddress: form.value.sameAddress,
      businessAddress: form.value.businessAddress,
      businessCity: form.value.businessCity,
      businessRegion: form.value.businessRegion,
      businessPostalCode: form.value.businessPostalCode,
      businessCountry: form.value.businessCountry,
      proofOfAddress: form.value.proofOfAddress

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

const nextStep = async () => {
   responseHandler.value.error = null;
   responseHandler.value.success = null;
   if (await validateStep()) {
      step.value++; // Move to next step if validation passes
   }
};

const addBusinessActivity = (event) => {
   const value = event.target.value
   if (!value) return

   // Find the option element to get its text content
   const option = event.target.querySelector(`option[value="${value}"]`)
   if (!option) return

   // Create new activity object
   const newActivity = {
      value: value,
      label: option.textContent.trim()
   }

   // Check if activity already exists
   const exists = form.value.businessActivities.some(activity => activity.value === value)
   if (!exists) {
      form.value.businessActivities.push(newActivity)
   }

   // Reset select to default option
   event.target.value = ''
}

const removeBusinessActivity = (activity) => {
   form.value.businessActivities = form.value.businessActivities.filter(
      a => a.value !== activity.value
   )
}

const addFundSource = (event) => {
   const value = event.target.value
   if (!value) return

   // Create source object with value and label
   const source = {
      value,
      label: event.target.options[event.target.selectedIndex].text
   }

   // Add to fundsSource array if not already present
   if (!form.value.fundsSource.some(s => s.value === source.value)) {
      form.value.fundsSource.push(source)
   }

   // Reset select to placeholder
   event.target.value = ''
}

const removeFundSource = (source) => {
   form.value.fundsSource = form.value.fundsSource.filter(s => s.value !== source.value)
}

const handleFileUpload = (event, field, shareholderIndex = null) => {
   const files = event.target.files;
   if (!files.length) return;

   // For single file uploads (like auditReport)
   if (field === 'auditReport') {
      form.value.auditReport = {
         file: files[0],
         name: files[0].name,
         type: ''
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

// Add validation for required file types
const validateFileType = (file, allowedTypes) => {
   const fileType = file.type.toLowerCase();
   return allowedTypes.some(type => fileType.includes(type));
};

onMounted(() => {
   sortedCountries.value = Object.fromEntries(
      Object.entries(countries).sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
   );

   sortedPhoneCodes.value = Object.fromEntries(
      Object.entries(phones).sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
   );
   phoneCodes.value = phones;
})

// Add a watch to update form.phoneCountry when selectedCountry changes
watch(selectedCountry, (newValue) => {
   form.value.phoneCountry = newValue;
})
</script>