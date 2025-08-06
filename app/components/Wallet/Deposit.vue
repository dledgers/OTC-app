<template>
   <div v-if="currency != 'EUR'" class="flex flex-col justify-center items-center h-full w-full">
      <canvas class="w-1/2" id="qr"></canvas>
      <br>
      <!-- <select @change="getUSDCAddress" v-if="props.currency === 'USDC'" v-model="usdcType">
         <option value="ETH">ETH</option>
         <option value="TRON">TRON</option>
      </select> -->
      <div class="flex items-center">
         <p class="text-xs max-w-[200px] text-center">{{ address ? `${address.slice(0, 10)}...${address.slice(-10)}` :
            ''
         }}</p>
         <Icon size="1.5em" name="material-symbols-light:copy-all" @click="copyAddress" />
      </div>
   </div>
   <div v-if="currency === 'EUR'"
      class="flex flex-col justify-start items-center h-full w-full p-4 text-sm overflow-y-auto">
      <!-- <h2 class="text-lg font-bold mb-4">Bank Transfer Details</h2> -->
      <div class="w-full max-w-md space-y-3">
         <div class="flex flex-col">
            <span class="font-semibold">{{ $t('wallet.deposit.bankDetails.beneficiaryName') }}</span>
            <div class="flex items-center">
               <span class="mr-2">Digital Ledgers S.L.</span>
               <Icon size="1.5em" name="material-symbols-light:copy-all" @click="copyText('Digital Ledgers S.L.')"
                  class="ml-auto" />
            </div>
         </div>
         <div class="flex flex-col">
            <span class="font-semibold">{{ $t('wallet.deposit.bankDetails.beneficiaryAddress') }}</span>
            <div class="flex items-center">
               <span class="mr-2">Calle Alcalá 75 dch 4 Madrid 28009 Spain</span>
               <Icon size="1.5em" name="material-symbols-light:copy-all"
                  @click="copyText('Calle Alcalá 75 dch 4 Madrid 28009 Spain')" class="ml-auto" />
            </div>
         </div>
         <div class="flex flex-col">
            <span class="font-semibold">{{ $t('wallet.deposit.bankDetails.bankName') }}</span>
            <div class="flex items-center">
               <span class="mr-2">EASY PAYMENT AND FINANCE EP</span>
               <Icon size="1.5em" name="material-symbols-light:copy-all"
                  @click="copyText('EASY PAYMENT AND FINANCE EP')" class="ml-auto" />
            </div>
         </div>
         <div class="flex flex-col">
            <span class="font-semibold">{{ $t('wallet.deposit.bankDetails.bankAddress') }}</span>
            <div class="flex items-center">
               <span class="mr-2">LEGANITOS 47-9 Madrid 28013 Spain</span>
               <Icon size="1.5em" name="material-symbols-light:copy-all"
                  @click="copyText('C/ Gran Vía, 57, 8E, 28013 Madrid, Spain')" class="ml-auto" />
            </div>
         </div>
         <div class="flex flex-col">
            <span class="font-semibold">{{ $t('wallet.deposit.bankDetails.iban') }}</span>
            <div class="flex items-center">
               <span class="mr-2"> ES1568490001510003864523</span>
               <Icon size="1.5em" name="material-symbols-light:copy-all" @click="copyText('ES1568490001510003864523')"
                  class="ml-auto" />
            </div>
         </div>
         <div class="flex flex-col">
            <span class="font-semibold">{{ $t('wallet.deposit.bankDetails.accountNumber') }}</span>
            <div class="flex items-center">
               <span class="mr-2"> 410032453083</span>
               <Icon size="1.5em" name="material-symbols-light:copy-all" @click="copyText('410032453083')"
                  class="ml-auto" />
            </div>
         </div>
         <div class="flex flex-col">
            <span class="font-semibold">{{ $t('wallet.deposit.bankDetails.swiftBic') }}</span>
            <div class="flex items-center">
               <span class="mr-2">EAPFESM2XXX</span>
               <Icon size="1.5em" name="material-symbols-light:copy-all" @click="copyText('EAPFESM2XXX')"
                  class="ml-auto" />
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import QRious from 'qrious';

const address = ref(null);
const usdcType = ref("ETH");
const profile = ref('');
const selectedAccount = ref(0); // Default to the first account
const selectedIBAN = ref('');
const amount = ref('0')

const props = defineProps({
   currency: String,
   data: Object
})

async function requestFundTransfer() {
   const res = await $fetch('/api/eisen', {
      method: "POST",
      body: {
         amount: amount.value,
         account: selectedAccount.value
      }
   })
}

async function getUSDCAddress() {
   if (usdcType.value === 'ETH') {
      address.value = profile.value[0].eth_address;
   } else if (usdcType.value === 'TRON') {
      address.value = profile.value[0].trx_address;
   }
   updateQRCode();
}

function updateQRCode() {
   var qr = new QRious({
      element: document.getElementById('qr'),
      value: address.value
   });
}

async function getProfile() {
   try {
      profile.value = await useProfile();
      console.log(profile.value)
      if (props.currency === 'USDC') {
         address.value = profile.value[0].eth_address;
      } else if (props.currency === 'BTC') {
         address.value = profile.value[0].btc_address;
      } else if (props.currency === 'TRX') {
         address.value = profile.value[0].trx_address;
      } else if (props.currency === 'ETH') {
         address.value = profile.value[0].eth_address;
      }
      if (profile.value[0]?.account_details?.length > 0) {
         selectedIBAN.value = profile.value[0].account_details[0].iban;
      }
   } catch (e) {
      console.log(e);
   }
}

function copyAddress() {
   navigator.clipboard.writeText(address.value)
      .then(() => {
         alert('Address copied to clipboard!');
      })
      .catch(err => {
         console.error('Failed to copy: ', err);
      });
}

function copyText(text) {
   navigator.clipboard.writeText(text)
      .then(() => {
         alert('Copied to clipboard!');
      })
      .catch(err => {
         console.error('Failed to copy: ', err);
      });
}

// Update IBAN when account is changed
function updateIBAN() {
   const account = profile.value[0]?.account_details[selectedAccount.value];
   selectedIBAN.value = account ? account.iban : '';
}

await getProfile();
onMounted(async () => {
   updateQRCode();
});
</script>