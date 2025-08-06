<template>
    <WalletTotalCard @option="handleSelectedOption" :currency="selectedCurrency" :data="myProfile" />
    <WalletBalance v-if="!selectedCurrency" @currency="handleCurrencyChange" :data="myProfile" />
    <p v-if="selectedOption === 'history' && selectedCurrency" class="text-center pt-2">{{ $t('wallet.history') }}</p>
    <HistoryWallet v-if="selectedOption === 'history' && selectedCurrency" />
    <WalletDeposit v-if="selectedOption === 'deposit'" :currency="selectedCurrency" />
    <WalletWithdraw v-if="selectedOption === 'withdraw'" :currency="selectedCurrency" :data="myProfile" />
</template>

<script setup>
const selectedCurrency = ref(null);
const selectedOption = ref('history');
const myProfile = ref(null);

async function getProfile() {
    try {
        const profile = await useProfile();
        myProfile.value = profile[0];
    } catch (e) {
        //handle error here
        console.log(e);
    }
}

async function handleCurrencyChange(currency) {
    selectedCurrency.value = currency.toUpperCase();
}

async function handleSelectedOption(option) {
    if (option === 'back') {
        selectedOption.value = 'history';
        selectedCurrency.value = null;
        return;
    }
    selectedOption.value = option;
}

onBeforeMount(async () => {
    await getProfile();
});
</script>