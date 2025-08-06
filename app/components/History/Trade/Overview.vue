<template>
   <div v-if="(isLoading || history.length === 0)" class="h-screen w-screen flex justify-center items-center">
      <p v-if="!isLoading && history.length === 0">{{ $t('history.trade.noTrades') }}</p>
      <span v-if="isLoading" class="loading loading-spinner loading-lg"></span>
   </div>
   <div class="stats stats-vertical">
      <div v-for="item in history" :key="item.id" @click="selectedTrade = item; showModal = true;" class="stat">
         <div class="stat-figure">
            <Icon class="w-8 h-8" :name="getIconName(item.receive_currency)" />
         </div>
         <div>{{ item.pair }}</div>
         <div class="stat-desc"
            :class="{ 'text-red-500': item.trade_side === 'sell', 'text-green-500': item.trade_side === 'buy' }">
            {{ item.trade_side === 'buy' ? $t('history.trade.side.buy') : $t('history.trade.side.sell') }}
         </div>
         <div class="stat-desc"><span>{{ getCurrencySymbol(item.receive_currency) }}</span>{{ item.receive_quantity }}
         </div>
         <div class="stat-desc">{{ formatDate(item.created_at) }}</div>
      </div>
   </div>
   <!-- MODAL TO SHOW TRADES -->
   <div class="modal" :class="{ 'modal-open': showModal }">
      <div class="modal-box w-11/12 max-w-5xl flex flex-col text-center justify-center items-center space-y-4">
         <!-- Icon and Title -->
         <figure class="flex flex-col items-center">
            <Icon :name="getIconName(selectedTrade.receive_currency)" class="w-20 h-20 mb-4" />
            <h2 class="text-2xl font-semibold">{{ selectedTrade.pair || null }}</h2>
         </figure>

         <!-- Trade Details -->
         <div class="w-full max-w-2xl grid grid-cols-2 gap-x-8 gap-y-4 text-left">
            <!-- Order ID -->
            <div>
               <p class="font-medium">{{ $t('history.trade.orderId') }}</p>
               <p class="text-gray-600">{{ selectedTrade.order_id || selectedTrade.quote_id }}</p>
            </div>

            <!-- Date/Time -->
            <div>
               <p class="font-medium">{{ $t('history.trade.dateTime') }}</p>
               <p class="text-gray-600">{{ formatDate(selectedTrade.created_at) || null }}</p>
            </div>

            <!-- Bought -->
            <div>
               <p class="font-medium">{{ $t('history.trade.bought') }}</p>
               <p class="text-gray-600">{{ getCurrencySymbol(selectedTrade.receive_currency) || null }} {{
                  selectedTrade.receive_quantity || null }}</p>
            </div>

            <!-- Sold -->
            <div>
               <p class="font-medium">{{ $t('history.trade.sold') }}</p>
               <p class="text-gray-600">{{ getCurrencySymbol(selectedTrade.deliver_currency) || null }} {{
                  selectedTrade.deliver_quantity || null }}</p>
            </div>

            <!-- Trade side -->
            <div>
               <p class="font-medium">{{ $t('history.trade.tradeSide') }}</p>
               <p class="text-gray-600">{{ selectedTrade.trade_side === 'buy' ? $t('history.trade.side.buy') :
                  $t('history.trade.side.sell') }}</p>
            </div>
         </div>

         <!-- Modal Action -->
         <div class="modal-action">
            <button class="btn" @click="showModal = false">{{ $t('history.trade.close') }}</button>
         </div>
      </div>
   </div>
</template>

<script setup>
const props = defineProps({
   history: {
      type: Array,
      required: true,
   },
});
const selectedTrade = ref({});
const isLoading = ref(true);
const showModal = ref(false);

const getCurrencySymbol = (currency) => {
   switch (currency) {
      case 'EUR':
         return '€';
      case 'BTC':
         return '₿';
      case 'USDC':
         return '$';
      default:
         break;
   }
};

const getIconName = (symbol) => {
   switch (symbol) {
      case 'BTC':
         return "token-branded:bitcoin"
      case 'EUR':
         return "circle-flags:european-union"
      case 'USDC':
         return "token-branded:usdc"
      case 'ETH':
         return "logos:ethereum"
      case 'TRX':
         return "token-branded:tron"
      case 'ETH_TEST5':
         return "logos:ethereum"
      case 'BTC_TEST':
         return "token-branded:bitcoin"
      case 'TRX_TEST':
         return "token-branded:tron"
      default:
         break;
   }
};

const formatDate = (dateString) => {
   const date = new Date(dateString);
   return date.toLocaleDateString();
};

watch(() => props.history,
   (newHistory, oldHistory) => {
      isLoading.value = false;
   }
);
</script>