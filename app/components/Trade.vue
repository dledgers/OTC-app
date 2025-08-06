<template>
    <div class="h-full flex flex-col justify-center items-center w-full">
        <h2 class="card-title">{{ $t('trade.title') }}</h2>
        <div class="card w-full shadow-2xl">
            <div class="card-body">
                <h2>{{ $t('trade.youSell') }}</h2>
                <h3 v-if="!isLoading" class="text-xs">{{ $t('trade.balance') }}
                    <span>{{ getCurrencySymbol(sellOption) }}</span>
                    <span>{{ myProfile ? formatBalance(myProfile[`${sellOption.toLowerCase()}_balance`], sellOption) :
                        null }}</span>
                </h3>
                <div class="flex flex-row gap-x-2">
                    <input :disabled="isLoading" type="number" v-model="sellAmount" @change="handleAmountUpdate('SELL')"
                        class="w-1/3 input input-bordered" />
                    <select class="w-2/3 select select-bordered" v-model="sellOption" @change="handleSellOptionChange">
                        <option v-for="option in filteredSellOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>
                <h2>{{ $t('trade.youBuy') }}</h2>
                <div class="flex flex-row pb-2 gap-x-2">
                    <input disabled type="number" v-model="buyAmount" @change="handleAmountUpdate('BUY')"
                        class="w-1/3 input input-bordered" />
                    <p class="flex justify-center items-center text-xl">≈</p>
                    <select class="w-2/3 select select-bordered" v-model="buyOption" @change="handleBuyOptionChange">
                        <option v-for="option in filteredBuyOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>
                <div class="flex flex-row justify-between">
                    <h3 v-if="!isLoading" class="text-xs">{{ $t('trade.balance') }}
                        <span>{{ getCurrencySymbol(buyOption) }}</span>
                        <span>{{ myProfile ? formatBalance(myProfile[`${buyOption.toLowerCase()}_balance`], buyOption) :
                            null }}</span>
                    </h3>
                </div>
                <p v-if="displayError" class="text-xs text-red-500">{{ displayError }}</p>
                <p v-if="displaySuccess" class="text-xs text-green-500">{{ displaySuccess }}</p>
                <div class="flex flex-row justify-center items-center pt-10">
                    <button :disabled="isLoading" class="btn btn-info" @click.prevent="getCexQuote">
                        {{ isLoading ? '' : $t('trade.requestQuote') }}
                        <span v-if="isLoading" class="loading loading-dots loading-xs"></span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- MODAL TO SHOW TRADES -->
    <div class="modal" :class="{ 'modal-open': showModal }">
        <div class="modal-box w-11/12 max-w-5xl">
            <div class="card w-full p-2 bg-base-100 shadow-2xl text-xs">
                <div class="card-body justify-center items-center">
                    <h2 class="card-title bold">{{ $t('trade.priceRequest') }}</h2>
                    <div class="grid grid-cols-2 gap-4 w-full">
                        <div class="text-right font-semibold">{{ $t('trade.side') }}:</div>
                        <div class="text-left">{{ rfq?.side || "" }}</div>

                        <div class="text-right font-semibold">{{ $t('trade.pair') }}:</div>
                        <div class="text-left">{{ rfq?.pair || "" }}</div>

                        <div class="text-right font-semibold">{{ $t('trade.amount') }}:</div>
                        <div class="text-left">{{ rfq?.amount || "" }} {{ rfq?.currency || "" }}</div>

                        <div class="text-right font-semibold">{{ $t('trade.counterAmount') }}:</div>
                        <div class="text-left">{{ rfq?.counterAmount || "" }} {{ rfq?.counterCurrency || ""
                        }}</div>

                        <div class="text-right font-semibold">{{ $t('trade.price') }}:</div>
                        <div class="text-left">{{ rfq?.price || "" }}</div>
                    </div>
                </div>
            </div>
            <div class="modal-action justify-center items-center">
                <button class="btn" @click="placeCexOrder" :disabled="isLoading">{{ isLoading ?
                    '' :
                    $t('trade.accept') }}<span v-if="isLoading" class="loading loading-dots loading-xs"></span></button>
                <button class="btn" @click="denyTrade" :disabled="isLoading">{{ isLoading ?
                    '' :
                    $t('trade.deny') }}<span v-if="isLoading" class="loading loading-dots loading-xs"></span></button>
            </div>
        </div>
    </div>
</template>

<script setup>
const { t } = useI18n();
const availablePairs = ['BTC-EUR', 'USDC-EUR', 'BTC-USDC', 'ETH-USDC', 'ETH-BTC', 'ETH-EUR']
const myProfile = ref(null);
const marketData = ref(null);
const isLoading = ref(true);
const showModal = ref(false);
const displayError = ref(null);
const displaySuccess = ref(null);
const selectedPair = ref('BTC-EUR');
const rfq = ref(null);
const sellOption = ref('EUR')
const buyOption = ref('BTC')
const buyAmount = ref(0);
const sellAmount = ref(0);
let basePair = "BTC";
let quotePair = "EUR";
let tradeSide = 'BUY';

const remainingTime = ref(0);
let timerInterval;

const availableOptions = computed(() => {
    const uniqueCurrencies = new Set(availablePairs.flatMap(pair => pair.split('-')))
    return Array.from(uniqueCurrencies).map(currency => ({
        label: `${getCurrencySymbol(currency)} ${currency}`,
        value: currency
    }))
})

const filteredSellOptions = computed(() => {
    return availableOptions.value // Display all available currencies in sell option
})

const filteredBuyOptions = computed(() => {
    return availableOptions.value.filter(option =>
        availablePairs.some(pair => {
            const [base, quote] = pair.split('-')
            return (base === sellOption.value && quote === option.value) ||
                (quote === sellOption.value && base === option.value)
        })
    )
})

function getCurrencySymbol(currency) {
    switch (currency) {
        case 'EUR': return '€'
        case 'BTC': return '₿'
        case 'USDC': return '$'
        default: return ''
    }
}

function handleSellOptionChange() {
    sellAmount.value = 0
    buyAmount.value = 0

    if (sellOption.value === buyOption.value) {
        const newBuyOption = filteredBuyOptions.value.find(option => option.value !== sellOption.value)?.value
        if (newBuyOption) buyOption.value = newBuyOption
    }
}

function handleBuyOptionChange() {
    sellAmount.value = 0
    buyAmount.value = 0
}

async function handleAmountUpdate(side) {
    await getPairData(buyOption.value, sellOption.value, side)
    checkBalance()
}

const calculateRemainingTime = () => {
    if (rfq.value) {
        const currentTime = Date.now();
        const expireTime = rfq.value.expireTime;
        remainingTime.value = Math.max((expireTime - currentTime) / 1000, 0);
    }
};

const startTimer = () => {
    calculateRemainingTime();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        remainingTime.value = Math.max(remainingTime.value - 1, 0);
        if (remainingTime.value <= 0) {
            clearInterval(timerInterval);
            showModal.value = false;
        }
    }, 1000);
};

// watch(rfq, () => {
//     if (rfq.value) {
//         startTimer();
//     }
// });

async function init() {
    getMarketData();
    getProfile();
}

async function getMarketData() {
    try {
        const cexData = await useCexMarketData();
        const btceur = cexData.data["BTC-EUR"]
        const usdceur = cexData.data["USDC-EUR"]
        const btcusdc = cexData.data["BTC-USDC"]
        // const trxusdc = cexData.data.TRX - USDC
        const ethusdc = cexData.data["ETH-USDC"]
        const ethbtc = cexData.data["ETH-BTC"]
        const etheur = cexData.data["ETH-EUR"]
        marketData.value = {
            BTCEUR: btceur,
            USDCEUR: usdceur.error ? { bestAsk: 1, bestBid: 1 } : usdceur,
            BTCUSDC: btcusdc,
            ETHEUR: etheur,
            ETHUSDC: ethusdc,
            ETHBTC: ethbtc,
        }
        isLoading.value = false
    } catch (e) {
        console.error(e)
        isLoading.value = false
    }
}

async function getProfile() {
    try {
        const profile = await useProfile()
        myProfile.value = profile[0]
    } catch (e) {
        console.error(e)
    }
}

function checkBalance() {
    const availableBalance = myProfile.value[`${sellOption.value.toLowerCase()}_balance`]
    if (sellAmount.value > availableBalance) {
        displayError.value = t('trade.errors.insufficientBalance')
        return false
    } else {
        displayError.value = null
        return true
    }
}

async function getRfqQuote() {
    isLoading.value = true;
    displayError.value = null;
    displaySuccess.value = null;
    const balance = await checkBalance();
    if (sellAmount.value < 0) {
        isLoading.value = false;
        displayError.value = t('trade.errors.amountGreaterThanZero');
        return;
    }
    if (!balance) {
        isLoading.value = false;
        return;
    }
    try {
        const res = await $fetch('/api/trade/create-rfq', {
            method: 'POST',
            body: {
                pair: selectedPair.value,
                tradeSide: tradeSide,
                buySymbol: buyOption.value,
                sellSymbol: sellOption.value,
                buyAmount: buyAmount.value,
                sellAmount: sellAmount.value
            }
        });
        showModal.value = true;
        rfq.value = res;
        console.log('RFQ', res)
        isLoading.value = false;
    } catch (e) {
        try {
            const error = JSON.parse(e.statusMessage);
            displayError.value = error.details[0].message;
        } catch (err) {
            displayError.value = e.statusMessage;
        }
        finally {
            isLoading.value = false;
        }
    }
}

async function executeRFQ() {
    try {
        isLoading.value = true;
        const res = await $fetch('/api/trade/execute-rfq', {
            method: 'POST',
            body: {
                quoteId: rfq.value.quoteId,
            }
        });
        if (res.message) {
            displayError.value = res.message;
            isLoading.value = false;
            showModal.value = false; denyTrade
            return;
        }
        rfq.value = res.payload;
        displaySuccess.value = t('trade.errors.tradeExecuted');
        isLoading.value = false;
        showModal.value = false;
        getProfile();
    } catch (e) {
        try {
            const error = JSON.parse(e.statusMessage);
            displayError.value = error.details[0].message;
        } catch (err) {
            displayError.value = e.statusMessage;
        }
        finally {
            isLoading.value = false;
            getProfile();
        }
    }
}

async function expireRFQ() {
    try {
        isLoading.value = true;
        const res = await $fetch('/api/trade/expire-rfq', {
            method: 'POST',
            body: {
                quoteId: rfq.value.quoteId,
            }
        });
        if (res.message) {
            displayError.value = res.message;
            isLoading.value = false;
            showModal.value = false;
            return;
        }
        rfq.value = res.payload;
        displaySuccess.value = t('trade.errors.tradeCancelled');
        isLoading.value = false;
        showModal.value = false;
    } catch (e) {
        try {
            const error = JSON.parse(e.statusMessage);
            displayError.value = error.details[0].message;
        } catch (err) {
            displayError.value = e.statusMessage;
        }
        finally {
            isLoading.value = false;
        }
    }
}

async function getCexQuote() {
    isLoading.value = true;
    displayError.value = null;
    displaySuccess.value = null;
    const balance = await checkBalance();
    if (sellAmount.value < 0) {
        isLoading.value = false;
        displayError.value = t('trade.errors.amountGreaterThanZero');
        return;
    }
    if (!balance) {
        isLoading.value = false;
        return;
    }
    try {
        const res = await $fetch('/api/trade/cex-market-quote', {
            method: 'POST',
            body: {
                side: tradeSide,
                currency: sellOption.value,
                counterCurrency: buyOption.value,
                amount: sellAmount.value
            }
        });
        showModal.value = true;
        rfq.value = res.data;
        console.log('RFQ', res)
        isLoading.value = false;
    } catch (e) {
        try {
            const error = JSON.parse(e.statusMessage);
            displayError.value = error.details[0].message;
        } catch (err) {
            displayError.value = e.statusMessage;
        }
        finally {
            isLoading.value = false;
        }
    }
}

async function placeCexOrder() {
    try {
        isLoading.value = true;
        const res = await $fetch('/api/trade/cex-order', {
            method: 'POST',
            body: {
                side: tradeSide,
                currency1: basePair,
                currency2: quotePair,
                amount: sellAmount.value,
            }
        });
        if (res.message) {
            displayError.value = res.message;
            isLoading.value = false;
            showModal.value = false;
            return;
        }
        rfq.value = res.data;
        displaySuccess.value = t('trade.errors.tradeExecuted');
        isLoading.value = false;
        showModal.value = false;
        getProfile();
    } catch (e) {
        try {
            const error = JSON.parse(e.statusMessage);
            displayError.value = error.details[0].message;
        } catch (err) {
            displayError.value = e.statusMessage;
        }
        finally {
            isLoading.value = false;
            showModal.value = false;
            getProfile();
        }
    }
}

async function denyTrade() {
    try {
        rfq.value = null;
        displaySuccess.value = t('trade.errors.tradeCancelled');
        isLoading.value = false;
        showModal.value = false;
    } catch (e) {
        try {
            const error = JSON.parse(e.statusMessage);
            displayError.value = error.details[0].message;
        } catch (err) {
            displayError.value = e.statusMessage;
        }
        finally {
            isLoading.value = false;
        }
    }
}

async function getPairData(buy, sell, side) {
    console.log("getPairData", buy, sell, side)
    let pair;
    if (buy === 'USDC' && sell === 'EUR' || sell === 'USDC' && buy === 'EUR') {
        pair = `USDCEUR`
        selectedPair.value = `USDC-EUR`
        basePair = 'USDC'
        quotePair = 'EUR'
        getSides(sell, side, pair, 'USDC')
    } else if (buy === 'BTC' && sell === 'EUR' || sell === 'BTC' && buy === 'EUR') {
        pair = `BTCEUR`
        selectedPair.value = `BTC-EUR`
        basePair = 'BTC'
        quotePair = 'EUR'
        getSides(sell, side, pair, 'BTC')
    } else if (buy === 'BTC' && sell === 'USDC' || sell === 'BTC' && buy === 'USDC') {
        pair = `BTCUSDC`
        selectedPair.value = `BTC-USDC`
        basePair = 'BTC'
        quotePair = 'USDC'
        getSides(sell, side, pair, 'BTC')
    } else if (buy === 'ETH' && sell === 'USDC' || sell === 'ETH' && buy === 'USDC') {
        getPairData
        pair = `ETHUSDC`
        selectedPair.value = `ETH-USDC`
        basePair = 'ETH'
        quotePair = 'USDC'
        getSides(sell, side, pair, 'ETH')
    } else if (buy === 'ETH' && sell === 'EUR' || sell === 'ETH' && buy === 'EUR') {
        pair = `ETHEUR`
        selectedPair.value = `ETH-EUR`
        basePair = 'ETH'
        quotePair = 'EUR'
        getSides(sell, side, pair, 'ETH')
    } else if (buy === 'ETH' && sell === 'BTC' || sell === 'ETH' && buy === 'BTC') {
        pair = `ETHBTC`
        selectedPair.value = `ETH-BTC`
        basePair = 'ETH'
        quotePair = 'BTC'
        getSides(sell, side, pair, 'ETH')
    } else {
        console.error("Invalid pair")
        return
    }
}

function getSides(sell, side, pair, symbol) {
    if (sell === symbol) {
        tradeSide = 'SELL'
        if (side === 'BUY') {
            sellAmount.value = (buyAmount.value / marketData.value[pair].bestAsk).toFixed(4)
        } else if (side === 'SELL') {
            buyAmount.value = (sellAmount.value * marketData.value[pair].bestBid).toFixed(4)
        }
    } else {
        tradeSide = 'BUY'
        if (side === 'BUY') {
            sellAmount.value = (buyAmount.value * marketData.value[pair].bestAsk).toFixed(4)
        } else if (side === 'SELL') {
            buyAmount.value = (sellAmount.value / marketData.value[pair].bestBid).toFixed(4)
        }
    }
}

function formatBalance(balance, currency) {
    if (!balance) return null;
    return currency === 'EUR'
        ? Number(balance).toFixed(2)
        : Number(balance).toFixed(4);
}

// Testing
onMounted(() => {
    init();
})
</script>