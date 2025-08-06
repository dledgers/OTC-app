<template>
   <form>
      <!--Detalles del contacto principal -->
      <div class="space-y-4 md:space-y-6">
         <div class="text-center">
            <h3 class="text-lg font-medium text-primary">{{ $t('forms.signup.primaryContact.title') }}</h3>
         </div>

         <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text font-medium">{{ $t('forms.signup.primaryContact.fields.firstName.label')
                     }}</span>
               </label>
               <input v-model="form.firstName" type="text" class="input input-bordered w-full" />
            </div>
            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text font-medium">{{ $t('forms.signup.primaryContact.fields.lastName.label')
                     }}</span>
               </label>
               <input v-model="form.lastName" type="text" class="input input-bordered w-full" />
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.primaryContact.fields.jobTitle.label') }}</span>
            </label>
            <input v-model="form.jobTitle" type="text" class="input input-bordered w-full" />
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.primaryContact.fields.phone.label') }}</span>
            </label>
            <div class="join w-full">
               <select class="select select-bordered join-item w-40" v-model="selectedCountry">
                  <option value="" disabled>{{ $t('forms.signup.primaryContact.fields.phone.selectCountry') }}</option>
                  <option v-for="(phoneCode, countryCode) in sortedPhoneCodes" :key="countryCode" :value="countryCode">
                     {{ sortedCountries[countryCode] }} {{ phoneCode }}
                  </option>
               </select>
               <input type="text" v-model="form.phone"
                  :placeholder="$t('forms.signup.primaryContact.fields.phone.placeholder')"
                  class="input input-bordered join-item w-full" />
            </div>
         </div>

         <div class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.primaryContact.fields.email.label') }}</span>
            </label>
            <input type="email" v-model="form.email"
               :placeholder="$t('forms.signup.primaryContact.fields.email.placeholder')"
               class="input input-bordered w-full" />
         </div>

         <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text font-medium">{{ $t('forms.signup.primaryContact.fields.telegram.label')
                     }}</span>
               </label>
               <input type="text" v-model="form.telegram" class="input input-bordered w-full" />
            </div>
            <div class="form-control w-full">
               <label class="label">
                  <span class="label-text font-medium">{{ $t('forms.signup.primaryContact.fields.slack.label') }}</span>
               </label>
               <input type="text" v-model="form.slack" class="input input-bordered w-full" />
            </div>
         </div>

         <div class="space-y-2">
            <p v-for="error in responseHandler.error" :key="error" class="text-xs text-error">
               *{{ error }}
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
const selectedCountry = ref('ES');
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
      firstName: Joi.string().required().messages({
         "string.empty": "First name is required"
      }),
      lastName: Joi.string().required().messages({
         "string.empty": "Last name is required"
      }),
      jobTitle: Joi.string().required().messages({
         "string.empty": "Job title is required"
      }),
      phoneCountry: Joi.string().required().messages({  // Add this validation
         "string.empty": "Phone country code is required"
      }),
      phone: Joi.string().required().messages({
         "string.empty": "Phone number is required"
      }),
      email: Joi.string().email({ tlds: { allow: false } }).required().messages({
         "string.empty": "Email is required",
         "string.email": "Please enter a valid email address"
      }),
      telegram: Joi.string().allow(''),
      slack: Joi.string().allow('')
   })
   // Extract the fields relevant to the current step from the form
   const fields = {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      jobTitle: form.value.jobTitle,
      phoneCountry: form.value.phoneCountry,  // Use actual form value
      phone: form.value.phone,
      email: form.value.email,
      telegram: form.value.telegram,
      slack: form.value.slack

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

onMounted(() => {
   sortedCountries.value = Object.fromEntries(
      Object.entries(countries).sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
   );

   sortedPhoneCodes.value = Object.fromEntries(
      Object.entries(phones).sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
   );
})

// Add a watch to update form.phoneCountry when selectedCountry changes
watch(selectedCountry, (newValue) => {
   form.value.phoneCountry = newValue;
})

// Initialize Spain as default
onMounted(() => {
   if (!form.value.phoneCountry) {
      selectedCountry.value = 'ES';
      form.value.phoneCountry = 'ES';
   }
})
</script>