<template>
   <form>
      <!-- Detalles de los accionistas -->
      <div class="space-y-4 md:space-y-6">
         <div v-for="(shareholder, shareholderIndex) in form.shareholders" :key="shareholderIndex"
            class="space-y-4 p-4 border rounded-lg">
            <div class="flex justify-between items-center">
               <h3 class="text-lg font-semibold">{{ $t('forms.signup.shareholderDetails.shareholderTitle', {
                  number:
                     shareholderIndex + 1
               }) }}</h3>
               <button v-if="form.shareholders.length > 1" @click="form.shareholders.splice(shareholderIndex, 1)"
                  class="btn btn-ghost btn-circle">
                  <Icon name="heroicons:x-mark" class="w-6 h-6" />
               </button>
            </div>

            <div class="form-control">
               <label class="label">
                  <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.percentage.label') }}</span>
                  <input v-model="shareholder.percentage" type="number" min="0" max="100"
                     class="input input-bordered w-full" />
               </label>
            </div>

            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.type.label') }}</span>
               </label>
               <select v-model="shareholder.type" class="select select-bordered w-full">
                  <option value="individual">{{ $t('forms.signup.shareholderDetails.fields.type.options.individual') }}
                  </option>
                  <option value="corporate">{{ $t('forms.signup.shareholderDetails.fields.type.options.corporate') }}
                  </option>
               </select>
            </div>

            <!-- Campos para accionista individual -->
            <div v-if="shareholder.type === 'individual'" class="space-y-4">
               <div class="space-y-4">
                  <div class="form-control w-full">
                     <label class="label">
                        <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.firstName.label')
                        }}</span>
                     </label>
                     <input type="text" v-model="shareholder.firstName" class="input input-bordered w-full" />
                  </div>

                  <div class="form-control w-full">
                     <label class="label">
                        <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.lastName.label')
                        }}</span>
                     </label>
                     <input type="text" v-model="shareholder.lastName" class="input input-bordered w-full" />
                  </div>

                  <div class="form-control w-full">
                     <label class="label">
                        <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.dob.label') }}</span>
                     </label>
                     <input type="date" v-model="shareholder.dob" class="input input-bordered w-full" />
                  </div>

                  <div class="form-control w-full">
                     <label class="label">
                        <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.nationality.label')
                        }}</span>
                     </label>
                     <select v-model="shareholder.nationality" class="select select-bordered w-full">
                        <option v-for="(name, code) in sortedCountries" :key="code" :value="code">
                           {{ name }}
                        </option>
                     </select>
                  </div>

                  <div class="form-control">
                     <label class="label cursor-pointer">
                        <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.dualCitizen.label')
                        }}</span>
                        <input v-model="shareholder.dualCitizen" type="checkbox" class="toggle" />
                     </label>
                  </div>

                  <div v-if="shareholder.dualCitizen" class="form-control w-full">
                     <label class="label">
                        <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.secondNationality.label')
                        }}</span>
                     </label>
                     <select v-model="shareholder.secondNationality" class="select select-bordered w-full">
                        <option v-for="(name, code) in sortedCountries" :key="code" :value="code">
                           {{ name }}
                        </option>
                     </select>
                  </div>

                  <div class="form-control w-full">
                     <label class="label">
                        <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.residenceCountry.label')
                        }}</span>
                     </label>
                     <select v-model="shareholder.residenceCountry" class="select select-bordered w-full">
                        <option v-for="(name, code) in sortedCountries" :key="code" :value="code">
                           {{ name }}
                        </option>
                     </select>
                  </div>

                  <div class="form-control w-full">
                     <label class="label">
                        <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.address.label') }}</span>
                     </label>
                     <input type="text" v-model="shareholder.address" class="input input-bordered w-full" />
                  </div>

                  <div class="form-control w-full">
                     <label class="label">
                        <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.city.label') }}</span>
                     </label>
                     <input type="text" v-model="shareholder.city" class="input input-bordered w-full" />
                  </div>

                  <div class="form-control w-full">
                     <label class="label">
                        <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.region.label') }}</span>
                     </label>
                     <input type="text" v-model="shareholder.region" class="input input-bordered w-full" />
                  </div>

                  <div class="form-control w-full">
                     <label class="label">
                        <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.postcode.label')
                        }}</span>
                     </label>
                     <input type="text" v-model="shareholder.postcode" class="input input-bordered w-full" />
                  </div>
               </div>
            </div>

            <!-- Campos para accionista corporativo -->
            <div v-if="shareholder.type === 'corporate'" class="space-y-4">
               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.companyName.label')
                     }}</span>
                  </label>
                  <input type="text" v-model="shareholder.companyName" class="input input-bordered w-full" />
               </div>

               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.companyCountry.label')
                     }}</span>
                  </label>
                  <select v-model="shareholder.companyCountry" class="select select-bordered w-full">
                     <option v-for="(name, code) in sortedCountries" :key="code" :value="code">
                        {{ name }}
                     </option>
                  </select>
               </div>

               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.companyRegNumber.label')
                     }}</span>
                  </label>
                  <input type="text" v-model="shareholder.companyRegNumber" class="input input-bordered w-full" />
               </div>

               <div class="form-control w-full">
                  <label class="label">
                     <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.companyDocs.label') }}
                        <sup>{{ $t('forms.signup.shareholderDetails.fields.companyDocs.maxSize') }}</sup></span>
                  </label>
                  <div class="space-y-4">
                     <div v-for="(file, index) in shareholder.companyDocs || []" :key="file.name + index"
                        class="flex gap-4">
                        <div class="grow">
                           <input type="text" :value="file.name" disabled class="input input-bordered w-full" />
                        </div>
                        <div class="w-72">
                           <select v-model="file.type" class="select select-bordered w-full">
                              <option value="">{{ $t('forms.signup.shareholderDetails.fields.companyDocs.selectType') }}
                              </option>
                              <option value="certificate">{{
                                 $t('forms.signup.shareholderDetails.fields.companyDocs.types.certificate') }}</option>
                              <option value="articles">{{
                                 $t('forms.signup.shareholderDetails.fields.companyDocs.types.articles') }}</option>
                              <option value="register">{{
                                 $t('forms.signup.shareholderDetails.fields.companyDocs.types.register') }}</option>
                              <option value="other">{{
                                 $t('forms.signup.shareholderDetails.fields.companyDocs.types.other') }}</option>
                           </select>
                        </div>
                        <button @click="shareholder.companyDocs.splice(index, 1)" class="btn btn-ghost btn-circle">
                           <Icon name="heroicons:x-mark" class="w-6 h-6" />
                        </button>
                     </div>
                  </div>
                  <input type="file" @change="handleFileUpload($event, 'companyDocs', shareholderIndex)"
                     class="file-input file-input-bordered w-full" multiple />
               </div>
            </div>

            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.phone.label') }}</span>
               </label>
               <div class="join w-full">
                  <select class="select select-bordered join-item w-40" v-model="shareholder.phoneCountry">
                     <option value="" disabled>{{ $t('forms.signup.shareholderDetails.fields.phone.selectCountry') }}
                     </option>
                     <option v-for="(phoneCode, countryCode) in sortedPhoneCodes" :key="countryCode"
                        :value="countryCode">
                        {{ sortedCountries[countryCode] }} {{ phoneCode }}
                     </option>
                  </select>
                  <input type="text" v-model="shareholder.phone"
                     :placeholder="$t('forms.signup.shareholderDetails.fields.phone.placeholder')"
                     class="input input-bordered join-item w-full" />
               </div>
            </div>

            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.email.label') }}</span>
               </label>
               <input type="email" v-model="shareholder.email"
                  :placeholder="$t('forms.signup.shareholderDetails.fields.email.placeholder')"
                  class="input input-bordered w-full" />
            </div>

            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.website.label') }}</span>
               </label>
               <input type="text" v-model="shareholder.website"
                  :placeholder="$t('forms.signup.shareholderDetails.fields.website.placeholder')"
                  class="input input-bordered w-full" />
            </div>

            <div class="form-control w-full" v-if="shareholder.type === 'individual'">
               <label class="label">
                  <span class="label-text">{{ $t('forms.signup.shareholderDetails.fields.idDocuments.label') }} <sup>{{
                     $t('forms.signup.shareholderDetails.fields.idDocuments.maxSize') }}</sup></span>
               </label>
               <div class="space-y-4">
                  <div v-for="(file, index) in shareholder.idDocuments || []" :key="file.name + index"
                     class="flex gap-4">
                     <div class="grow">
                        <input type="text" :value="file.name" disabled class="input input-bordered w-full" />
                     </div>
                     <div class="w-72">
                        <select v-model="file.type" class="select select-bordered w-full">
                           <option value="">{{ $t('forms.signup.shareholderDetails.fields.idDocuments.selectType') }}
                           </option>
                           <option value="passport">{{
                              $t('forms.signup.shareholderDetails.fields.idDocuments.types.passport') }}</option>
                           <option value="national_id">{{
                              $t('forms.signup.shareholderDetails.fields.idDocuments.types.nationalId') }}</option>
                        </select>
                     </div>
                     <button @click="shareholder.idDocuments.splice(index, 1)" class="btn btn-ghost btn-circle">
                        <Icon name="heroicons:x-mark" class="w-6 h-6" />
                     </button>
                  </div>
               </div>
               <input type="file" @change="handleFileUpload($event, 'idDocuments', shareholderIndex)"
                  class="file-input file-input-bordered w-full" multiple />
            </div>
         </div>

         <button @click="addNewShareholder" type="button" class="btn btn-outline w-full">
            {{ $t('forms.signup.shareholderDetails.buttons.addShareholder') }}
         </button>

         <!-- Mostrar errores -->
         <div v-if="responseHandler.error && responseHandler.error.length > 0" class="space-y-2">
            <p v-for="error in responseHandler.error" :key="error" class="text-xs text-error">
               {{ error }}
            </p>
         </div>

         <div class="flex gap-4">
            <button @click="previousStep" type="button" class="btn btn-outline flex-1">{{
               $t('forms.signup.primaryContact.buttons.previous') }}</button>
            <button @click="nextStep" type="button" class="btn btn-primary flex-1">{{
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
      shareholders: Joi.array().min(1).items(
         Joi.object({
            type: Joi.string().valid('individual', 'corporate').required(),
            sameAsSignatory: Joi.boolean(),
            percentage: Joi.number().min(0).max(100).required().messages({
               "number.base": "Percentage is required",
               "number.min": "Percentage must be between 0 and 100",
               "number.max": "Percentage must be between 0 and 100"
            }),
            firstName: Joi.when('type', {
               is: 'individual',
               then: Joi.string().required().messages({
                  "string.empty": "First name is required"
               })
            }),
            lastName: Joi.when('type', {
               is: 'individual',
               then: Joi.string().required().messages({
                  "string.empty": "Last name is required"
               })
            }),
            dob: Joi.when('type', {
               is: 'individual',
               then: Joi.date().required().messages({
                  "date.base": "Date of birth must be a valid date"
               })
            }),
            nationality: Joi.when('type', {
               is: 'individual',
               then: Joi.string().required().messages({
                  "string.empty": "Nationality is required"
               })
            }),
            dualCitizen: Joi.boolean(),
            secondNationality: Joi.when('dualCitizen', {
               is: true,
               then: Joi.string().required().messages({
                  "string.empty": "Second nationality is required when dual citizenship is selected"
               })
            }),
            residenceCountry: Joi.when('type', {
               is: 'individual',
               then: Joi.string().required().messages({
                  "string.empty": "Country of residence is required"
               })
            }),
            address: Joi.when('type', {
               is: 'individual',
               then: Joi.string().required().messages({
                  "string.empty": "Address is required"
               })
            }),
            city: Joi.when('type', {
               is: 'individual',
               then: Joi.string().required().messages({
                  "string.empty": "City is required"
               })
            }),
            region: Joi.when('type', {
               is: 'individual',
               then: Joi.string().required().messages({
                  "string.empty": "Region is required"
               })
            }),
            postcode: Joi.when('type', {
               is: 'individual',
               then: Joi.string().required().messages({
                  "string.empty": "Postal code is required"
               })
            }),
            companyName: Joi.when('type', {
               is: 'corporate',
               then: Joi.string().required().messages({
                  "string.empty": "Company name is required"
               })
            }),
            companyRegNumber: Joi.when('type', {
               is: 'corporate',
               then: Joi.string().required().messages({
                  "string.empty": "Registration number is required"
               })
            }),
            companyCountry: Joi.when('type', {
               is: 'corporate',
               then: Joi.string().required().messages({
                  "string.empty": "Country of incorporation is required"
               })
            }),
            companyDocs: Joi.when('type', {
               is: 'corporate',
               then: Joi.array().min(1).items(
                  Joi.object({
                     file: Joi.any().required(),
                     name: Joi.string().required(),
                     type: Joi.string().required().messages({
                        "string.empty": "Document type must be selected"
                     })
                  })
               ).required().messages({
                  "array.min": "At least one company document is required"
               })
            }),
            phoneCountry: Joi.string().required().messages({
               "string.empty": "Phone country code is required"
            }),
            phone: Joi.string().required().messages({
               "string.empty": "Phone number is required"
            }),
            email: Joi.string().email({ tlds: { allow: false } }).required().messages({
               "string.empty": "Email is required",
               "string.email": "Please enter a valid email address"
            }),
            website: Joi.string().uri().allow('').messages({
               "string.uri": "Please enter a valid website URL"
            }),
            idDocuments: Joi.when('type', {
               is: 'individual',
               then: Joi.array().min(1).items(
                  Joi.object({
                     file: Joi.any().required(),
                     name: Joi.string().required(),
                     type: Joi.string().required().messages({
                        "string.empty": "Document type must be selected"
                     })
                  })
               ).required().messages({
                  "array.min": "At least one ID document is required"
               })
            })
         })
      ).required().messages({
         "array.min": "At least one shareholder is required"
      })
   })

   // Extract the fields relevant to the current step from the form
   const fields = {
      shareholders: form.value.shareholders
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

const previousStep = () => {
   responseHandler.value.error = null;
   responseHandler.value.success = null;
   step.value--;
};

const addNewShareholder = () => {
   form.value.shareholders.push({
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
   });
};

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
})

// Remove the global watch since we're now binding directly to individual shareholder phoneCountry
</script>