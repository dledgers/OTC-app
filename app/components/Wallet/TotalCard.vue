<template>
   <div class="card bg-base-100 shadow-xl pb-2">
      <div class="card-body">
         <h2 class="card-title">{{ currency ? currency : $t('wallet.totalBalance') }} </h2>
         <p v-if="!isLoading">{{ currency ? getCurrencySymbol(currency) : getCurrencySymbol('EUR') }}{{ currency ?
            Number(data[currency.toLowerCase() + '_balance']).toFixed(currency === 'EUR' ? 2 : 8)
            :
            totalBalance.toFixed(0)
         }}
         </p>
         <span v-if="isLoading" class="loading loading-dots loading-xs"></span>
      </div>
      <div v-if="currency" class="flex flex-row justify-evenly">
         <div @click="$emit('option', 'history')" class="flex flex-col justify-center items-center">
            <Icon size="1.5em" name="material-symbols-light:history" />
            <p class="text-xs">{{ $t('wallet.history') }}</p>
         </div>
         <div @click="$emit('option', 'deposit')" class="flex flex-col justify-center items-center">
            <Icon color="green" size="1.5em" name="ph:hand-deposit-thin" />
            <p class="text-xs text-green-500">{{ $t('wallet.deposit.title') }}</p>
         </div>
         <div @click="$emit('option', 'withdraw')" class="flex flex-col justify-center items-center">
            <Icon color="red" size="1.5em" name="ph:hand-withdraw-thin" />
            <p class="text-xs text-red-500">{{ $t('wallet.withdraw.title') }}</p>
         </div>
         <div @click="$emit('option', 'back')" class="flex flex-col justify-center items-center">
            <Icon size="1.5em" name="lets-icons:back-light" />
            <p class="text-xs">{{ $t('wallet.back') }}</p>
         </div>
      </div>
   </div>
</template>

<script setup>
const props = defineProps({
   currency: String,
   data: Object
})

const isLoading = ref(true);

const totalBalance = ref(0);

const getCurrencySymbol = (currency) => {
   switch (currency) {
      case 'EUR':
         return '€';
      case 'BTC':
         return '₿';
      case 'USDC':
         return '$';
      default:
         return ' ';
   }
};



watch(() => props.data, async (newVal) => {
   if (newVal) {
      // totalBalance.value = newVal[`${currency}_balance`];
      //I get the market data from the API and calculate the total balance
      try {
         const cexData = await useCexMarketData();
         const btc = cexData.data["BTC-EUR"]
         const usdc = cexData.data["USDC-EUR"].error ? { bestAsk: 1, bestBid: 1 } : cexData.data["USDC-EUR"]
         const eth = cexData.data["ETH-EUR"]
         const btcConversion = btc.bestAsk * newVal.btc_balance;
         const usdcConversion = usdc.bestAsk * newVal.usdc_balance;
         //The EUR in the trxCOnverstion needs to be in usdc value

         const ethConversion = eth.bestAsk * newVal.eth_balance;
         totalBalance.value = newVal.eur_balance + btcConversion + usdcConversion + ethConversion;
         isLoading.value = false;
      } catch (e) {
         console.log(e);
      }
   }
})
</script>