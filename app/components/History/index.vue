<template>
    <div role="tablist" class="tabs tabs-box flex w-full justify-center items-center">
        <a role="tab" @click="handleBtnNav('Trades')" :class="{ 'tab-active': activeNav === 'Trades' }"
            class="tab basis-1/2">{{ $t('history.tabs.trades') }}</a>
        <a role="tab" @click="handleBtnNav('Wallet')" :class="{ 'tab-active': activeNav === 'Wallet' }"
            class="tab basis-1/2">{{ $t('history.tabs.transactions') }}</a>
    </div>

    <HistoryTrade v-if="activeNav === 'Trades'" />
    <HistoryWallet v-if="activeNav === 'Wallet'" />

</template>

<script setup>
const activeNav = ref('Trades');

function handleBtnNav(option) {
    activeNav.value = option;
}
</script>