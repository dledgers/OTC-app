<template>
   <form>
      <!--Información de PEP -->
      <div class="space-y-4 md:space-y-6">
         <div class="form-control w-full">
            <label class="">
               <span class="label-text font-medium">{{ $t('forms.signup.pepInformation.fields.isPep.label') }}</span>
            </label>
            <div class="flex gap-4">
               <label class="label cursor-pointer justify-start gap-2">
                  <input v-model="form.isPep" type="radio" name="isPep" :value="true" class="radio" />
                  <span class="label-text">{{ $t('forms.signup.pepInformation.fields.isPep.options.yes') }}</span>
               </label>
               <label class="label cursor-pointer justify-start gap-2">
                  <input v-model="form.isPep" type="radio" name="isPep" :value="false" class="radio" />
                  <span class="label-text">{{ $t('forms.signup.pepInformation.fields.isPep.options.no') }}</span>
               </label>
            </div>
         </div>

         <div v-if="form.isPep" class="form-control w-full">
            <label class="label">
               <span class="label-text font-medium">{{ $t('forms.signup.pepInformation.fields.pepDetails.title')
               }}</span>
            </label>
            <div class="space-y-2">
               <div v-for="(pep, index) in form.pepDetails" :key="index" class="flex flex-row gap-x-4 items-center">
                  <div class="basis-1/3">
                     <input type="text" v-model="pep.name"
                        :placeholder="$t('forms.signup.pepInformation.fields.pepDetails.namePlaceholder')"
                        class="input input-bordered w-full" />
                  </div>
                  <div class="basis-1/3">
                     <input type="text" v-model="pep.office"
                        :placeholder="$t('forms.signup.pepInformation.fields.pepDetails.officePlaceholder')"
                        class="input input-bordered w-full" />
                  </div>
                  <div class="basis-1/3">
                     <input type="text" v-model="pep.country"
                        :placeholder="$t('forms.signup.pepInformation.fields.pepDetails.countryPlaceholder')"
                        class="input input-bordered w-full" />
                  </div>
                  <button v-if="index > 0" @click="form.pepDetails.splice(index, 1)" type="button"
                     class="btn btn-ghost btn-circle">
                     <Icon name="heroicons:x-mark" class="w-5 h-5 text-error" />
                  </button>
               </div>
               <button @click="form.pepDetails.push({ name: '', office: '', country: '' })" type="button"
                  class="btn btn-outline btn-primary btn-sm">
                  <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
                  {{ $t('forms.signup.pepInformation.fields.pepDetails.addPep') }}
               </button>
            </div>
         </div>

         <div class="space-y-2">
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

const step = useState('signupStep')

const form = useState('signupForm')

const responseHandler = ref({
   error: null,
   success: null,
})

async function validateStep() {
   const schema = Joi.object({
      isPep: Joi.boolean().required(),
      pepDetails: Joi.when('isPep', {
         is: true,
         then: Joi.array().min(1).items(
            Joi.object({
               name: Joi.string().required().messages({
                  "string.empty": "PEP name is required"
               }),
               office: Joi.string().required().messages({
                  "string.empty": "Public office/relation is required"
               }),
               country: Joi.string().required().messages({
                  "string.empty": "Country of public office is required"
               })
            })
         ).messages({
            "array.min": "At least one PEP detail is required when PEP is selected"
         })
      })
   })

   // Extract the fields relevant to the current step from the form
   const fields = {
      isPep: form.value.isPep,
      pepDetails: form.value.pepDetails
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

</script>