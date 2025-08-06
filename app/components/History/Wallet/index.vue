<template>
   <div class="flex flex-row gap-x-2 p-2 justify-center">
      <select v-model="selectedCurrency" class="basis-1/3 select select-bordered select-xs min-w-[100px]">
         <option disabled value="">{{ $t('history.wallet.currency') }}</option>
         <option value="EUR">EUR</option>
         <option value="BTC">BTC</option>
         <option value="USDC">USDC</option>
         <option value="ETH">ETH</option>
         <!-- <option value="TRX">TRX</option> -->
      </select>
      <select v-model="selectedType" class="basis-1/3 select select-bordered select-xs min-w-[100px]">
         <option disabled value="">{{ $t('history.wallet.type') }}</option>
         <option value="withdraw">{{ $t('history.wallet.types.withdraw') }}</option>
         <option value="deposit">{{ $t('history.wallet.types.deposit') }}</option>
      </select>
      <select v-model="selectedTimeline" class="basis-1/3 select select-bordered select-xs min-w-[100px]">
         <option disabled value="">{{ $t('history.wallet.timeline') }}</option>
         <option value="3">{{ $t('history.wallet.timelineOptions.3months') }}</option>
         <option value="6">{{ $t('history.wallet.timelineOptions.6months') }}</option>
         <option value="12">{{ $t('history.wallet.timelineOptions.1year') }}</option>
      </select>
      <button @click="resetFilters"
         class="btn btn-ghost btn-xs px-1 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
         title="Reset Filters">
         <Icon size="1.2em" name="material-symbols-light:refresh" />
      </button>
   </div>
   <HistoryWalletOverview :history="filteredData" :unConfirmed="unConfirmedTransaction" />
</template>

<script setup>
const historicalData = ref([]);
const unConfirmedTransaction = ref([])
const selectedCurrency = ref('');
const selectedType = ref('');
const selectedTimeline = ref('');

const filteredData = computed(() => {
   let filtered = historicalData.value;

   if (selectedCurrency.value) {
      filtered = filtered.filter(trade => trade.currency === selectedCurrency.value);
   }

   if (selectedType.value) {
      filtered = filtered.filter(trade => trade.transaction_type === selectedType.value);
   }

   if (selectedTimeline.value) {
      const currentDate = new Date();
      const timePeriod = selectedTimeline.value * 30 * 24 * 60 * 60 * 1000; // Convert months to milliseconds
      const cutoffDate = new Date(currentDate.getTime() - timePeriod);
      filtered = filtered.filter(trade => new Date(trade.created_at) >= cutoffDate);
   }

   return filtered;
});

async function getWalletHistory() {
   // Fetch trades
   try {
      const res = await $fetch("/api/history/wallets", {
         method: "GET",
      });
      historicalData.value = res.confirmed;
      unConfirmedTransaction.value = res.unConfirmed;
      console.log('HIstorical data', historicalData.value);
      console.log('Unconfirmed data', unConfirmedTransaction.value);
   } catch (e) {
      //Handle error from db or server
      console.log(e);
   }
}

function resetFilters() {
   selectedCurrency.value = '';
   selectedType.value = '';
   selectedTimeline.value = '';
}

onMounted(() => {
   getWalletHistory();
});

</script>