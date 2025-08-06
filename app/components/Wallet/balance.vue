<template>
   <div class="stats stats-vertical pt-10">

      <div @click="$emit('currency', 'btc')" class="stat">
         <div class="stat-figure">
            <Icon class="w-8 h-8" name="token-branded:bitcoin" />
         </div>
         <div>Bitcoin</div>
         <div v-if="data?.btc_balance >= 0" class="stat-desc">&#8383;{{ formatBalance(data?.btc_balance) }}</div>
         <span v-else class="loading loading-dots loading-xs"></span>
      </div>

      <div @click="$emit('currency', 'eth')" class="stat">
         <div class="stat-figure">
            <Icon class="w-8 h-8" name="logos:ethereum" />
         </div>
         <div>Ethereum</div>
         <div v-if="data?.eth_balance >= 0" class="stat-desc">{{ formatBalance(data?.eth_balance) }}</div>
         <span v-else class="loading loading-dots loading-xs"></span>
      </div>

      <!-- <div @click="$emit('currency', 'trx')" class="stat">
         <div class="stat-figure">
            <Icon class="w-8 h-8" name="token-branded:tron" />
         </div>
         <div>Tron</div>
         <div v-if="data?.trx_balance >= 0" class="stat-desc">{{ formatBalance(data?.trx_balance) }}</div>
         <span v-else class="loading loading-dots loading-xs"></span>
      </div> -->

      <div class="stat" @click="$emit('currency', 'usdc')">
         <div class="stat-figure ">
            <Icon class="w-8 h-8" name="token-branded:usdc" />
         </div>
         <div>USDC</div>
         <div v-if="data?.usdc_balance >= 0" class="stat-desc">${{ formatBalance(data?.usdc_balance) }}</div>
         <span v-else class="loading loading-dots loading-xs"></span>
      </div>

      <div class="stat" @click="$emit('currency', 'eur')">
         <div class="stat-figure">
            <Icon class="w-8 h-8" name="circle-flags:european-union" />
         </div>
         <div>Euro</div>
         <div v-if="data?.eur_balance >= 0" class="stat-desc">&#8364;{{ formatBalance(data?.eur_balance, 'eur') }}</div>
         <span v-else class="loading loading-dots loading-xs"></span>
      </div>
   </div>
</template>

<script setup>
const props = defineProps({
   data: Object
})

const formatBalance = (value, currency) => {
   if (!value) return 0
   const num = Number(value)
   if (currency === 'eur') {
      return num.toFixed(2)
   }
   const decimalPlaces = (num.toString().split('.')[1] || '').length
   return decimalPlaces > 8 ? num.toFixed(8) : num
}
</script>