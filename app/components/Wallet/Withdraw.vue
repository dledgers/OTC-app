<template>
   <div v-if="currency != 'EUR'" class="p-4 flex flex-col justify-center space-y-2 h-full">
      <div v-if="!displaySuccess">
         <h2>{{ $t('wallet.withdraw.amount') }}</h2>
         <div class="flex flex-row gap-x-2">
            <input v-model="selectedAmount" @click.prevent="selectedAmount = null" type="number"
               class="w-full input input-bordered " />
         </div>
         <!-- <h2 v-if="currency === 'USDC'">Network type</h2>
         <div v-if="currency === 'USDC'" class="flex flex-row gap-x-2">
            <select v-model="selectedNetwork" class="w-full select select-bordered ">
               <option value="ETH">ETH (ERC20)</option>
               <option value="TRON">TRON (TRC20)</option>
            </select>
         </div> -->
         <h2>{{ $t('wallet.withdraw.walletAddress') }}</h2>
         <div class="flex flex-row gap-x-2">
            <input v-model="address" type="text" class="w-full input input-bordered"
               :placeholder="getAddressPlaceholder()" />
         </div>

         <!-- Show withdrawal process info -->
         <!-- <div v-if="address" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
            <p class="text-sm text-yellow-800">
               <strong>{{ $t('wallet.withdraw.note') }}:</strong>
               {{ $t('wallet.withdraw.actualWithdrawalInfo') }}
            </p>
         </div> -->

         <div class="flex flex-row justify-between">
            <h3 class="text-xs pt-2">{{ $t('wallet.withdraw.balance') }}:
               <span v-if="currency === 'EUR'">€</span>
               <span v-else-if="currency === 'BTC'">&#8383;</span>
               <span v-else-if="currency === 'USDC'">$</span>
               <span>{{ data ?
                  data[`${currency?.toLowerCase()}_balance`] : null
               }}</span>
            </h3>
         </div>
         <div class="card-actions flex flex-row justify-center items-center pt-10">
            <button class="btn" @click.prevent="handleWithdraw">{{ isLoading ? '' :
               $t('wallet.withdraw.submit') }}<span v-if="isLoading"
                  class="loading loading-dots loading-xs"></span></button>
         </div>
      </div>

      <p v-if="displayError" class="text-xs text-red-500">{{ displayError }}</p>
      <div v-if="displaySuccess" class="flex justify-center items-center">
         <p class="text-green-500">{{ displaySuccess }}</p>
      </div>
   </div>
   <div v-if="currency === 'EUR'" class="flex flex-col h-full w-full p-4 overflow-y-auto">
      <!-- Success State -->
      <div v-if="displaySuccess" class="flex flex-col items-center justify-center h-full space-y-6">
         <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
               <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
               </svg>
            </div>
            <h2 class="text-xl font-semibold text-green-800 mb-2">{{ $t('wallet.withdraw.euro.successTitle') }}</h2>
            <div class="text-gray-600 max-w-md mx-auto space-y-2">
               <p>{{ displaySuccess }}</p>
               <p class="text-sm">{{ $t('wallet.withdraw.euro.emailConfirmation') }}</p>
               <p class="text-sm">{{ $t('wallet.withdraw.euro.reviewProcess') }}</p>
            </div>
         </div>
         <div class="flex space-x-4">
            <button class="btn btn-primary" @click="resetForm">
               {{ $t('wallet.withdraw.euro.submitAnother') }}
            </button>
            <button class="btn btn-outline" @click="goBackToWallet">
               {{ $t('wallet.withdraw.euro.close') }}
            </button>
         </div>
      </div>

      <!-- Form State -->
      <div v-else>
         <!-- Error Message at Top -->
         <div v-if="displayError" class="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
               viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ displayError }}</span>
         </div>

         <!-- Amount Section -->
         <div class="space-y-4 mb-6">
            <h2 class="text-lg font-semibold">{{ $t('wallet.withdraw.amount') }}</h2>
            <input v-model="eurForm.amount" type="number" step="0.01" min="0" class="w-full input input-bordered"
               :placeholder="$t('wallet.withdraw.amount')" />
            <div class="text-sm text-gray-600">
               {{ $t('wallet.withdraw.available') }}: €{{ data ? data.eur_balance : 0 }}
            </div>
         </div>

         <!-- Beneficiary Information -->
         <div class="space-y-4 mb-6">
            <h2 class="text-lg font-semibold">{{ $t('wallet.withdraw.euro.beneficiaryInfo') }}</h2>

            <div>
               <label class="label">{{ $t('wallet.withdraw.euro.beneficiaryName') }}</label>
               <input v-model="eurForm.beneficiaryName" type="text" class="w-full input input-bordered"
                  :placeholder="$t('wallet.withdraw.euro.beneficiaryName')" />
            </div>

            <div>
               <label class="label">{{ $t('wallet.withdraw.euro.beneficiaryAddress') }}</label>
               <textarea v-model="eurForm.beneficiaryAddress" class="w-full textarea textarea-bordered" rows="3"
                  :placeholder="$t('wallet.withdraw.euro.beneficiaryAddress')"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
               <div>
                  <label class="label">{{ $t('wallet.withdraw.euro.city') }}</label>
                  <input v-model="eurForm.beneficiaryCity" type="text" class="w-full input input-bordered"
                     :placeholder="$t('wallet.withdraw.euro.city')" />
               </div>
               <div>
                  <label class="label">{{ $t('wallet.withdraw.euro.postalCode') }}</label>
                  <input v-model="eurForm.beneficiaryPostalCode" type="text" class="w-full input input-bordered"
                     :placeholder="$t('wallet.withdraw.euro.postalCode')" />
               </div>
            </div>

            <div>
               <label class="label">{{ $t('wallet.withdraw.euro.country') }}</label>
               <select v-model="eurForm.beneficiaryCountry" class="w-full select select-bordered">
                  <option value="">{{ $t('wallet.withdraw.euro.selectCountry') }}</option>
                  <option v-for="country in euCountries" :key="country.code" :value="country.code">
                     {{ country.name }}
                  </option>
               </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
               <div>
                  <label class="label">{{ $t('wallet.withdraw.euro.email') }} ({{ $t('wallet.withdraw.euro.optional')
                  }})</label>
                  <input v-model="eurForm.beneficiaryEmail" type="email" class="w-full input input-bordered"
                     :placeholder="$t('wallet.withdraw.euro.email')" />
               </div>
               <div>
                  <label class="label">{{ $t('wallet.withdraw.euro.phone') }} ({{ $t('wallet.withdraw.euro.optional')
                  }})</label>
                  <input v-model="eurForm.beneficiaryPhone" type="tel" class="w-full input input-bordered"
                     :placeholder="$t('wallet.withdraw.euro.phone')" />
               </div>
            </div>
         </div>

         <!-- Bank Information -->
         <div class="space-y-4 mb-6">
            <h2 class="text-lg font-semibold">{{ $t('wallet.withdraw.euro.bankInfo') }}</h2>

            <div>
               <label class="label">{{ $t('wallet.withdraw.euro.iban') }}</label>
               <input v-model="eurForm.iban" type="text" class="w-full input input-bordered"
                  :placeholder="$t('wallet.withdraw.euro.ibanPlaceholder')" @input="formatIban" />
            </div>

            <div>
               <label class="label">{{ $t('wallet.withdraw.euro.bicSwift') }}</label>
               <input v-model="eurForm.bicSwift" type="text" class="w-full input input-bordered"
                  :placeholder="$t('wallet.withdraw.euro.bicSwiftPlaceholder')" />
            </div>

            <div>
               <label class="label">{{ $t('wallet.withdraw.euro.bankName') }}</label>
               <input v-model="eurForm.bankName" type="text" class="w-full input input-bordered"
                  :placeholder="$t('wallet.withdraw.euro.bankName')" />
            </div>

            <div>
               <label class="label">{{ $t('wallet.withdraw.euro.bankAddress') }} ({{ $t('wallet.withdraw.euro.optional')
               }})</label>
               <textarea v-model="eurForm.bankAddress" class="w-full textarea textarea-bordered" rows="3"
                  :placeholder="$t('wallet.withdraw.euro.bankAddress')"></textarea>
            </div>
         </div>

         <!-- Transfer Details -->
         <div class="space-y-4 mb-6">
            <h2 class="text-lg font-semibold">{{ $t('wallet.withdraw.euro.transferDetails') }}</h2>

            <div>
               <label class="label">{{ $t('wallet.withdraw.euro.reference') }} ({{ $t('wallet.withdraw.euro.optional')
               }})</label>
               <input v-model="eurForm.transferReference" type="text" maxlength="140"
                  class="w-full input input-bordered" :placeholder="$t('wallet.withdraw.euro.referencePlaceholder')" />
               <div class="text-xs text-gray-500 mt-1">
                  {{ eurForm.transferReference?.length || 0 }}/140
               </div>
            </div>

            <div>
               <label class="label">{{ $t('wallet.withdraw.euro.purpose') }}</label>
               <select v-model="eurForm.transferPurpose" class="w-full select select-bordered">
                  <option value="">{{ $t('wallet.withdraw.euro.selectPurpose') }}</option>
                  <option value="business_payment">{{ $t('wallet.withdraw.euro.purposes.businessPayment') }}</option>
                  <option value="salary">{{ $t('wallet.withdraw.euro.purposes.salary') }}</option>
                  <option value="investment_return">{{ $t('wallet.withdraw.euro.purposes.investmentReturn') }}</option>
                  <option value="service_payment">{{ $t('wallet.withdraw.euro.purposes.servicePayment') }}</option>
                  <option value="other">{{ $t('wallet.withdraw.euro.purposes.other') }}</option>
               </select>
            </div>
         </div>

         <!-- Submit Button -->
         <div class="flex justify-center pt-6 pb-8">
            <button class="btn btn-primary w-full max-w-md" @click.prevent="handleEurWithdraw"
               :disabled="isLoading || !isEurFormValid">
               <span v-if="isLoading" class="loading loading-dots loading-xs"></span>
               {{ isLoading ? '' : $t('wallet.withdraw.submit') }}
            </button>
         </div>

      </div>
   </div>
</template>

<script setup>
const selectedNetwork = ref('ETH');
const selectedAmount = ref(0);
const address = ref(null);
const displayError = ref(null);
const displaySuccess = ref(null);
const isLoading = ref(false);
const activeNav = ref('Withdraw');

// EUR Form State
const eurForm = ref({
   amount: null,
   beneficiaryName: '',
   beneficiaryAddress: '',
   beneficiaryCity: '',
   beneficiaryPostalCode: '',
   beneficiaryCountry: '',
   beneficiaryEmail: '',
   beneficiaryPhone: '',
   iban: '',
   bicSwift: '',
   bankName: '',
   bankAddress: '',
   transferReference: '',
   transferPurpose: ''
});

// EU Countries for SEPA
const euCountries = ref([
   { code: 'AT', name: 'Austria' },
   { code: 'BE', name: 'Belgium' },
   { code: 'BG', name: 'Bulgaria' },
   { code: 'HR', name: 'Croatia' },
   { code: 'CY', name: 'Cyprus' },
   { code: 'CZ', name: 'Czech Republic' },
   { code: 'DK', name: 'Denmark' },
   { code: 'EE', name: 'Estonia' },
   { code: 'FI', name: 'Finland' },
   { code: 'FR', name: 'France' },
   { code: 'DE', name: 'Germany' },
   { code: 'GR', name: 'Greece' },
   { code: 'HU', name: 'Hungary' },
   { code: 'IS', name: 'Iceland' },
   { code: 'IE', name: 'Ireland' },
   { code: 'IT', name: 'Italy' },
   { code: 'LV', name: 'Latvia' },
   { code: 'LI', name: 'Liechtenstein' },
   { code: 'LT', name: 'Lithuania' },
   { code: 'LU', name: 'Luxembourg' },
   { code: 'MT', name: 'Malta' },
   { code: 'MC', name: 'Monaco' },
   { code: 'NL', name: 'Netherlands' },
   { code: 'NO', name: 'Norway' },
   { code: 'PL', name: 'Poland' },
   { code: 'PT', name: 'Portugal' },
   { code: 'RO', name: 'Romania' },
   { code: 'SM', name: 'San Marino' },
   { code: 'SK', name: 'Slovakia' },
   { code: 'SI', name: 'Slovenia' },
   { code: 'ES', name: 'Spain' },
   { code: 'SE', name: 'Sweden' },
   { code: 'CH', name: 'Switzerland' }
]);

const props = defineProps({
   currency: String,
   data: Object
})

// EUR Form Validation
const isEurFormValid = computed(() => {
   return eurForm.value.amount > 0 &&
      eurForm.value.beneficiaryName.trim() !== '' &&
      eurForm.value.beneficiaryAddress.trim() !== '' &&
      eurForm.value.beneficiaryCity.trim() !== '' &&
      eurForm.value.beneficiaryPostalCode.trim() !== '' &&
      eurForm.value.beneficiaryCountry !== '' &&
      eurForm.value.iban.trim() !== '' &&
      eurForm.value.bicSwift.trim() !== '' &&
      eurForm.value.bankName.trim() !== '' &&
      eurForm.value.transferPurpose !== '' &&
      isValidIban(eurForm.value.iban);
});

// IBAN Validation (basic)
function isValidIban(iban) {
   if (!iban) return false;
   // Remove spaces and convert to uppercase
   const cleanIban = iban.replace(/\s/g, '').toUpperCase();
   // Basic length check (minimum 15, maximum 34 characters)
   return cleanIban.length >= 15 && cleanIban.length <= 34 && /^[A-Z0-9]+$/.test(cleanIban);
}

// Format IBAN with spaces
function formatIban() {
   let iban = eurForm.value.iban.replace(/\s/g, '').toUpperCase();
   // Add spaces every 4 characters
   iban = iban.replace(/(.{4})/g, '$1 ').trim();
   eurForm.value.iban = iban;
}

// Handle EUR withdrawal
async function handleEurWithdraw() {
   displayError.value = null;
   displaySuccess.value = null;
   isLoading.value = true;

   try {
      // Validate balance
      const availableBalance = props.data?.eur_balance || 0;
      if (eurForm.value.amount > availableBalance) {
         displayError.value = "Insufficient balance";
         isLoading.value = false;
         return;
      }

      // Validate minimum amount (e.g., 10 EUR)
      if (eurForm.value.amount < 10) {
         displayError.value = "Minimum withdrawal amount is €10";
         isLoading.value = false;
         return;
      }

      // Submit EUR withdrawal request
      const res = await $fetch('/api/withdraw-eur', {
         method: 'POST',
         body: {
            amount: eurForm.value.amount,
            currency: 'EUR',
            beneficiaryName: eurForm.value.beneficiaryName,
            beneficiaryAddress: eurForm.value.beneficiaryAddress,
            beneficiaryCity: eurForm.value.beneficiaryCity,
            beneficiaryPostalCode: eurForm.value.beneficiaryPostalCode,
            beneficiaryCountry: eurForm.value.beneficiaryCountry,
            beneficiaryEmail: eurForm.value.beneficiaryEmail || null,
            beneficiaryPhone: eurForm.value.beneficiaryPhone || null,
            iban: eurForm.value.iban.replace(/\s/g, ''), // Remove spaces
            bicSwift: eurForm.value.bicSwift,
            bankName: eurForm.value.bankName,
            bankAddress: eurForm.value.bankAddress || null,
            transferReference: eurForm.value.transferReference || null,
            transferPurpose: eurForm.value.transferPurpose
         },
         headers: useRequestHeaders(['cookie'])
      });

      displaySuccess.value = "EUR withdrawal request submitted successfully. You will receive an email confirmation shortly and we will review your request as quickly as possible.";

      // Reset form
      eurForm.value = {
         amount: null,
         beneficiaryName: '',
         beneficiaryAddress: '',
         beneficiaryCity: '',
         beneficiaryPostalCode: '',
         beneficiaryCountry: '',
         beneficiaryEmail: '',
         beneficiaryPhone: '',
         iban: '',
         bicSwift: '',
         bankName: '',
         bankAddress: '',
         transferReference: '',
         transferPurpose: ''
      };

   } catch (e) {
      try {
         const error = JSON.parse(e.statusMessage);
         displayError.value = error.details?.[0]?.message || error.message || "Error submitting withdrawal request";
      } catch (err) {
         displayError.value = e.statusMessage || "Error submitting withdrawal request";
      }
   } finally {
      isLoading.value = false;
   }
}

// Reset form to submit another withdrawal
function resetForm() {
   displaySuccess.value = null;
   displayError.value = null;
   eurForm.value = {
      amount: null,
      beneficiaryName: '',
      beneficiaryAddress: '',
      beneficiaryCity: '',
      beneficiaryPostalCode: '',
      beneficiaryCountry: '',
      beneficiaryEmail: '',
      beneficiaryPhone: '',
      iban: '',
      bicSwift: '',
      bankName: '',
      bankAddress: '',
      transferReference: '',
      transferPurpose: ''
   };
}

// Go back to wallet (you might want to emit an event or navigate)
function goBackToWallet() {
   // This could emit an event to parent component or navigate
   // For now, just reset the form
   resetForm();
}

function handleBtnNav(option) {
   activeNav.value = option;
}

function getAddressPlaceholder() {
   if (props.currency === 'BTC') {
      return 'Enter your BTC address (e.g., bc1q...)';
   } else if (props.currency === 'ETH' || props.currency === 'USDC') {
      return 'Enter your ETH address (e.g., 0x...)';
   }
   return 'Enter your wallet address';
}

const init = () => {
   if (props.currency) {
      //WHAT THE FUCK DID I DO HERE
   }
}

async function checkBalance() {
   const avalailableBalance = props.data[`${props.currency.toLowerCase()}_balance`];
   if (selectedAmount.value > avalailableBalance) {
      displayError.value = "Insufficient balance";
      return false;
   } else {
      displayError.value = null;
      return true;
   }
}

async function handleWithdraw() {
   displayError.value = null;
   displaySuccess.value = null;
   isLoading.value = true;

   // Validate address input
   if (!address.value || address.value.trim() === '') {
      displayError.value = "Please enter your wallet address";
      isLoading.value = false;
      return;
   }

   // Add minimum amount validation
   const minAmounts = {
      'ETH': 0.02,
      'BTC': 0.001,
      'EUR': 25000,
      'USDC': 15
   };

   if (selectedAmount.value < minAmounts[props.currency]) {
      displayError.value = `Minimum withdrawal amount for ${props.currency} is ${minAmounts[props.currency]} ${props.currency}`;
      isLoading.value = false;
      return;
   }

   const balance = await checkBalance();
   if (selectedAmount.value < 0) {
      displayError.value = "Amount must be greater than 0";
      isLoading.value = false;
      return;
   }

   if (!balance) {
      isLoading.value = false;
      displayError.value = "Insufficient balance";
      return;
   }

   //withdraw logic here
   try {
      const res = await $fetch('/api/withdraw-cex', {
         method: 'POST',
         body: {
            requestedAddress: address.value, // User's desired address
            amount: selectedAmount.value,
            currency: props.currency,
         },
         headers: useRequestHeaders(['cookie'])
      });
      displaySuccess.value = "Withdrawal request submitted successfully. Funds will be sent to the system wallet and then forwarded to your address.";
      isLoading.value = false;

      // Clear form
      selectedAmount.value = 0;
      address.value = null;
   } catch (e) {
      try {
         const error = JSON.parse(e.statusMessage);
         displayError.value = error.details[0].message;
      } catch (err) {
         // Handle the case where e.statusMessage is not a valid JSON string
         displayError.value = e.statusMessage; // Or any other error message you prefer
      }
      finally {
         isLoading.value = false;
      }
   }
}

onMounted(() => {
   init();
})
</script>