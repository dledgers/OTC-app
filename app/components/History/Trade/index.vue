<template>
   <div class="flex flex-row gap-x-2 p-2 justify-center">
      <select v-model="selectedCurrency" class="basis-1/3 select select-bordered select-xs">
         <option disabled value="">{{ $t('history.trade.currency') }}</option>
         <option value="BTC/USDC">BTC/USDC</option>
         <option value="BTC/EUR">BTC/EUR</option>
         <option value="USDC/EUR">USDC/EUR</option>
         <option value="ETH/USDC">ETH/USDC</option>
         <option value="TRX/USDC">TRX/USDC</option>
         <option value="ETH/BTC">ETH/BTC</option>
      </select>
      <select v-model="selectedType" class="basis-1/3 select select-bordered select-xs">
         <option disabled value="">{{ $t('history.trade.type') }}</option>
         <option value="buy">{{ $t('history.trade.side.buy') }}</option>
         <option value="sell">{{ $t('history.trade.side.sell') }}</option>
      </select>
      <select v-model="selectedTimeline" class="basis-1/3 select select-bordered select-xs">
         <option disabled value="">{{ $t('history.trade.timeline') }}</option>
         <option value="3">{{ $t('history.trade.timelineOptions.3months') }}</option>
         <option value="6">{{ $t('history.trade.timelineOptions.6months') }}</option>
         <option value="12">{{ $t('history.trade.timelineOptions.1year') }}</option>
      </select>
      <button @click="resetFilters"
         class="btn btn-ghost btn-xs px-1 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
         title="Reset Filters">
         <Icon size="1.2em" name="material-symbols-light:refresh" />
      </button>
   </div>
   <HistoryTradeOverview :history="filteredData" />
</template>

<script setup>
const historicalData = ref([]);
const selectedCurrency = ref('');
const selectedType = ref('');
const selectedTimeline = ref('');

const filteredData = computed(() => {
   let filtered = historicalData.value;

   if (selectedCurrency.value) {
      filtered = filtered.filter(trade => trade.pair === selectedCurrency.value);
   }

   if (selectedType.value) {
      filtered = filtered.filter(trade => trade.trade_side === selectedType.value);
   }

   if (selectedTimeline.value) {
      const currentDate = new Date();
      const timePeriod = selectedTimeline.value * 30 * 24 * 60 * 60 * 1000; // Convert months to milliseconds
      const cutoffDate = new Date(currentDate.getTime() - timePeriod);
      filtered = filtered.filter(trade => new Date(trade.created_at) >= cutoffDate);
   }

   return filtered;
});

async function getTrades() {
   // Fetch trades
   try {
      const res = await $fetch("/api/history/trades", {
         method: "GET",
      });
      historicalData.value = res;
      console.log("HISTORY", res);
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
   getTrades();
});
</script>