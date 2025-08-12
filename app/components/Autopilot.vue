<template>
    <div class="h-full flex flex-col justify-center items-center w-full">
        <h2 class="card-title bold">{{ selectedDeposit }} {{ $t('autopilot.title') }}</h2>
        <div class="card w-full shadow-2xl">
            <div class="card-body">
                <h2>{{ selectedDeposit }} {{ $t('autopilot.status') }}</h2>
                <div class="pb-4">
                    <div class="flex flex-row pb-2 gap-x-2">
                        <span class="label-text text-lg">{{ $t('autopilot.toggle.off') }}</span>
                        <input type="checkbox" class="toggle toggle-primary" v-model="selectedActive" />
                        <span class="label-text text-lg">{{ $t('autopilot.toggle.on') }}</span>
                    </div>
                    <h2 class="text-primary">{{ $t('autopilot.onDepositing') }}</h2>
                    <div class="flex flex-row pb-2 gap-x-2">
                        <select class="w-full select select-primary select-bordered" @change="handleDepositChange"
                            v-model="selectedDeposit">
                            <option v-for="option in availableOptions" :key="option.value" :value="option.value">{{
                                option.label }}</option>
                        </select>
                    </div>
                    <div :class="{ 'invisible': !selectedActive }">
                        <h2>{{ $t('autopilot.convertTo') }}</h2>
                        <div class="flex flex-row pb-2 gap-x-2">
                            <select class="w-full select select-bordered" v-model="selectedConvert">
                                <option v-for="option in availableOptions.filter(o => o.value !== selectedDeposit)"
                                    :key="option.value" :value="option.value">{{ option.label }}</option>
                            </select>
                        </div>
                        <h2 v-if="selectedConvert">{{ $t('autopilot.automateWithdrawal') }}</h2>
                        <div v-if="selectedConvert" class="flex flex-row py-2 gap-x-2">
                            <span class="label-text text-xs">{{ $t('autopilot.toggle.no') }}</span>
                            <input type="checkbox" class="toggle toggle-primary toggle-xs" @click="handleAutoWithdraw"
                                v-model="autoWithdraw" />
                            <span class="label-text text-xs">{{ $t('autopilot.toggle.yes') }}</span>
                        </div>
                        <div class="flex flex-col py-2" v-if="autoWithdraw && selectedActive">
                            <input v-if="selectedConvert === 'BTC'" type="text"
                                :placeholder="$t('autopilot.walletAddress.btc')" class="w-full input input-bordered"
                                v-model="selectedWithdraw" />
                            <input v-if="selectedConvert === 'ETH'" type="text"
                                :placeholder="$t('autopilot.walletAddress.eth')" class="w-full input input-bordered"
                                v-model="selectedWithdraw" />
                            <div class="space-y-3" v-else-if="selectedConvert === 'USDC'">
                                <select class="w-full select select-bordered" v-model="selectedNetwork">
                                    <!-- <option value="TRC20">TRC20</option> -->
                                    <option value="ERC20">ERC20</option>
                                </select>
                                <input type="text" :placeholder="$t('autopilot.walletAddress.usdc')"
                                    class="w-full input input-bordered" v-model="selectedWithdraw" />
                            </div>
                            <div v-else-if="selectedConvert === 'EUR' && myProfile.account_details">
                                <select class="w-full select select-bordered" v-model="selectedWithdraw">
                                    <option v-for="account in myProfile.account_details" :key="account.account_number"
                                        :value="`${account.account_number} - ${account.iban}`">
                                        {{ account.account_number }} - {{ account.iban }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-row justify-center items-center mt-4">
                        <button :disabled="isLoading" @click="saveAutopilot" class="btn">{{ $t('autopilot.updateButton',
                            { currency: selectedDeposit }) }}</button>
                    </div>
                    <p class="text-xs pt-4" :class="{ 'text-red-500': displayError, 'text-green-500': displaySuccess }">
                        {{ displaySuccess || displayError }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const { t } = useI18n();
const isLoading = ref(false);
const displayError = ref(null);
const displaySuccess = ref(null);
const myProfile = ref(null);
const autoWithdraw = ref(false);
const usersAutopilot = ref(null);
const selectedDeposit = ref(null);
const selectedConvert = ref(null);
const selectedWithdraw = ref(null);
const selectedNetwork = ref('ERC20');
const selectedActive = ref(null);
const availableOptions = ref([
    { label: 'EUR', value: 'EUR' },
    { label: 'BTC', value: 'BTC' },
    { label: 'USDC', value: 'USDC' },
    { label: 'ETH', value: 'ETH' },
]);

async function init() {
    await getProfile();
    getAutopilot();
}

async function handleAutoWithdraw() {
    displaySuccess.value = null;
    displayError.value = null;
    if (!autoWithdraw.value) {
        selectedWithdraw.value = null;
        selectedNetwork.value = null;
    } else if (autoWithdraw.value) {
        for (let i = 0; i < usersAutopilot.value.length; i++) {
            if (usersAutopilot.value[i].deposited_currency === selectedDeposit.value) {
                selectedWithdraw.value = usersAutopilot.value[i].withdraw_to;
                selectedNetwork.value = usersAutopilot.value[i].network;
                displaySuccess.value = null;
                break;
            }
        }
    }
}

async function handleDepositChange() {
    for (let i = 0; i < usersAutopilot.value.length; i++) {
        if (usersAutopilot.value[i].deposited_currency === selectedDeposit.value) {
            selectedConvert.value = usersAutopilot.value[i].convert_currency;
            selectedWithdraw.value = usersAutopilot.value[i].withdraw_to;
            selectedNetwork.value = usersAutopilot.value[i].network;
            selectedActive.value = usersAutopilot.value[i].active;
            selectedDeposit.value = usersAutopilot.value[i].deposited_currency;
            autoWithdraw.value = usersAutopilot.value[i].auto_withdraw;
            displaySuccess.value = null;
            displayError.value = null;
            break;
        }
    }
}

async function saveAutopilot() {
    displaySuccess.value = null;
    displayError.value = null;
    try {
        isLoading.value = true;
        const res = await $fetch("/api/autopilot", {
            method: "PUT",
            body: {
                deposited_currency: selectedDeposit.value,
                convert_currency: selectedActive.value ? selectedConvert.value : null,
                withdraw_to: selectedActive.value ? selectedWithdraw.value : null,
                network: selectedActive.value ? selectedNetwork.value : null,
                active: selectedActive.value,
                auto_withdraw: selectedActive.value ? autoWithdraw.value : false,
            },
            headers: useRequestHeaders(['cookie'])
        });
        displaySuccess.value = t('autopilot.success');
        getAutopilot(true);
    } catch (e) {
        isLoading.value = false;
        console.log(e)
        displayError.value = e.message;
        console.error(t('autopilot.errors.fetchError'), e);
    }
}

async function getAutopilot(updated = false) {
    try {
        isLoading.value = true;
        const { data: res } = await useFetch("/api/autopilot");
        isLoading.value = false;
        usersAutopilot.value = res;
        if (Array.isArray(res) && !updated) {
            usersAutopilot.value = res;
            selectedDeposit.value = res[0].deposited_currency;
            selectedConvert.value = res[0].convert_currency;
            selectedWithdraw.value = res[0].withdraw_to;
            selectedNetwork.value = res[0].network;
            selectedActive.value = res[0].active;
            autoWithdraw.value = res[0].auto_withdraw;
        }
    } catch (e) {
        isLoading.value = false;
        displayError.value = e.message;
        console.error(t('autopilot.errors.fetchError'), e);
    }
}

async function getProfile() {
    try {
        const profile = await useProfile();
        myProfile.value = profile[0];
    } catch (e) {
        console.log(e);
    }
}

onMounted(() => {
    init();
})
</script>