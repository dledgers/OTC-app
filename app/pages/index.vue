<template>
   <div class="container mx-auto h-[100dvh] font-mono flex flex-col overflow-hidden w-screen p-2">

      <NuxtLayout name="default" @btmnav="handleBtnNav">
         <Trade v-if="activeNav === 'Trade'" />
         <Wallet v-if="activeNav === 'Wallet'" />
         <Autopilot v-if="activeNav === 'Autopilot'" />
         <History v-if="activeNav === 'History'" />
         <Settings v-if="activeNav === 'Settings'" />
      </NuxtLayout>
   </div>
</template>

<script setup>

const activeNav = ref('Wallet');

definePageMeta({
   layout: false,
   middleware: 'mfa'
});

function handleBtnNav(option) {
   activeNav.value = option;
}

onMounted(async () => {
   try {
      console.log('STARTING CEX REQUEST');
      let cexData = await useCexMarketData();
      console.log('CEX DATA', cexData);
   } catch (e) {
      console.log(e);
   }
});

</script>