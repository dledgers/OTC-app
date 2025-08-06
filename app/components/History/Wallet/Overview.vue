<template>
  <!-- LOADING SCREEN -->
  <div
    v-if="isLoading || (unConfirmedTransactions.length === 0 && history.length === 0 && pendingEurWithdrawals.length === 0)"
    class="h-screen w-screen flex justify-center items-center">
    <span v-if="isLoading" class="loading loading-spinner loading-lg"></span>
    <p
      v-if="!isLoading && unConfirmedTransactions.length === 0 && history.length === 0 && pendingEurWithdrawals.length === 0">
      No transactions found</p>
  </div>

  <!-- TRANSACTION HISTORY -->
  <div class="stats stats-vertical">
    <!-- Pending EUR Withdrawal Requests -->
    <template v-if="pendingEurWithdrawals.length > 0">
      <div v-for="(item, index) in pendingEurWithdrawals" :key="`eur-${index}`" class="stat">
        <div class="stat-figure">
          <Icon class="w-8 h-8" name="circle-flags:european-union" />
        </div>
        <div>EUR Withdrawal</div>
        <div class="stat-desc">
          <span>€</span>{{ item.amount }}
        </div>
        <div class="stat-desc text-orange-500">
          {{ $t('history.wallet.withdrawal.pendingReview') }}
        </div>
        <div class="stat-desc">{{ formatDate(item.created_at) }}</div>
        <div class="stat-actions">
          <button class="btn btn-sm btn-error btn-outline" @click="cancelWithdrawal(item.id)"
            :disabled="cancellingId === item.id">
            <span v-if="cancellingId === item.id" class="loading loading-spinner loading-xs"></span>
            {{ cancellingId === item.id ? $t('history.wallet.withdrawal.cancelling') :
              $t('history.wallet.withdrawal.cancel') }}
          </button>
        </div>
      </div>
    </template>

    <!-- Unconfirmed Transactions -->
    <template v-if="unConfirmedTransactions.length > 0">
      <div v-for="(item, index) in unConfirmedTransactions" :key="index" class="stat">
        <div class="stat-figure">
          <Icon class="w-8 h-8" :name="getIconName(item.symbol)" />
        </div>
        <div>{{ item.symbol }}</div>
        <div class="stat-desc">
          <span>{{ getCurrencySymbol(item.symbol) }}</span>{{ item.amount }}
        </div>
        <div class="stat-desc text-green-500">
          Deposit
        </div>
        <div class="stat-desc">Processing {{ dots }}</div>
      </div>
    </template>

    <!-- Confirmed Transactions -->
    <div v-for="item in history" :key="item.id" @click="selectedTransaction = item; showModal = true" class="stat">
      <div class="stat-figure">
        <Icon class="w-8 h-8" :name="getIconName(item.currency || item.symbol)" />
      </div>
      <div>{{ item.currency || item.symbol }}</div>
      <div class="stat-desc">
        <span>{{ getCurrencySymbol(item.currency || item.symbol) }}</span>{{ item.amount || item.quantity }}
      </div>
      <div class="stat-desc"
        :class="{ 'text-red-500': item.direction === 'withdraw' || item.transaction_type === 'WITHDRAW', 'text-green-500': item.direction === 'deposit' || item.transaction_type === 'DEPOSIT' }">
        {{ item.direction ? item.direction.toUpperCase() : item.transaction_type }}
      </div>
      <div class="stat-desc">{{ formatDate(item.created_at) }}</div>
      <div class="stat-desc font-bold">Confirmed</div>
    </div>
  </div>

  <!-- MODAL TO SHOW TRADES -->
  <div class="modal" :class="{ 'modal-open': showModal }">
    <div class="modal-box w-11/12 max-w-5xl flex flex-col text-center justify-center items-center space-y-4">
      <!-- Icon and Title -->
      <figure class="flex flex-col items-center">
        <Icon :name="getIconName(selectedTransaction.currency || selectedTransaction.symbol)" class="w-20 h-20 mb-4" />
        <h2 class="text-2xl font-semibold">{{ selectedTransaction.currency || selectedTransaction.symbol }}</h2>
      </figure>

      <!-- Transaction Details -->
      <div class="w-full max-w-2xl grid grid-cols-2 gap-x-8 gap-y-4 text-left">
        <!-- Order ID -->
        <div>
          <p class="font-medium">Order ID</p>
          <p class="text-gray-600">{{ selectedTransaction.tx_id || selectedTransaction.id }}</p>
        </div>

        <!-- Date -->
        <div>
          <p class="font-medium">Date/Time</p>
          <p class="text-gray-600">{{ formatDate(selectedTransaction.created_at) }}</p>
        </div>

        <!-- Amount Deposited -->
        <div>
          <p class="font-medium">Amount</p>
          <p class="text-gray-600">{{ getCurrencySymbol(selectedTransaction.currency || selectedTransaction.symbol) }}{{
            selectedTransaction.amount || selectedTransaction.actual_quantity || selectedTransaction.quantity }}</p>
        </div>

        <!-- Fees -->
        <div>
          <p class="font-medium">Fees</p>
          <p class="text-gray-600">{{ selectedTransaction.fee_amount || selectedTransaction.deposit_fee_amount || '0' }}
          </p>
        </div>

        <!-- Balance -->
        <div>
          <p class="font-medium">Credit</p>
          <p class="text-gray-600">{{ getCurrencySymbol(selectedTransaction.currency || selectedTransaction.symbol) }}{{
            selectedTransaction.amount || selectedTransaction.quantity }}
          </p>
        </div>

        <!-- Type -->
        <div>
          <p class="font-medium">Type</p>
          <p class="text-gray-600">{{ selectedTransaction.direction ? selectedTransaction.direction.toUpperCase() :
            selectedTransaction.transaction_type }}</p>
        </div>

        <!-- Address -->
        <div>
          <p class="font-medium">Address</p>
          <p class="text-gray-600 break-all">{{ selectedTransaction.destination || selectedTransaction.address || `Admin
            made` }}</p>
        </div>

        <!-- txHash -->
        <div>
          <p class="font-medium">txHash</p>
          <p class="text-gray-600 break-all">{{ selectedTransaction.blockchain_tx_id || selectedTransaction.tx_hash ||
            "Admin made" }}</p>
        </div>

        <!-- Status -->
        <div>
          <p class="font-medium">Status</p>
          <p class="text-green-500">{{ selectedTransaction.status || 'Confirmed' }}</p>
        </div>
      </div>

      <!-- Modal Action -->
      <div class="modal-action">
        <button class="btn" @click="showModal = false">Close</button>
      </div>
    </div>
  </div>

</template>

<script setup>

// Define component properties
const props = defineProps({
  history: {
    type: Array,
    required: true,
  },
  unConfirmed: {
    type: Object,
    required: true,
  },
});

// State variables
const isLoading = ref(true);
const selectedTransaction = ref({});
const showModal = ref(false);
const dots = ref('');
const pendingEurWithdrawals = ref([]);
const cancellingId = ref(null);
let interval;

// Computed property to transform unConfirmed data into an array
const unConfirmedTransactions = computed(() => {
  let transactions = [];
  for (const symbol in props.unConfirmed) {
    const assetArray = props.unConfirmed[symbol];
    assetArray.forEach((transaction) => {
      transactions.push({
        ...transaction,
        symbol, // Add the symbol to each transaction
      });
    });
  }
  return transactions;
});

// Watch for changes in history prop to update loading state
watch(() => props.history, () => {
  isLoading.value = false;
});

// Watch for changes in unConfirmed prop to update loading state
watch(() => props.unConfirmed, () => {
  isLoading.value = false;
});

// Fetch pending EUR withdrawal requests
const fetchPendingEurWithdrawals = async () => {
  try {
    console.log('Fetching pending EUR withdrawals...');
    const client = useSupabaseClient();
    const user = useSupabaseUser();

    console.log('Current user:', user.value?.id);

    const { data, error } = await client
      .from('eur_withdrawal_requests')
      .select('*')
      .eq('status', 'requested')
      .order('created_at', { ascending: false });

    console.log('Supabase response:', { data, error });
    console.log('Data length:', data ? data.length : 0);

    if (error) {
      console.error('Error fetching pending EUR withdrawals:', error);
      return;
    }

    pendingEurWithdrawals.value = data || [];
    console.log('Pending EUR withdrawals set to:', pendingEurWithdrawals.value);
    console.log('pendingEurWithdrawals.value.length:', pendingEurWithdrawals.value.length);
  } catch (error) {
    console.error('Error fetching pending EUR withdrawals:', error);
  }
};

// Cancel EUR withdrawal request
const cancelWithdrawal = async (requestId) => {
  if (!requestId) return;

  cancellingId.value = requestId;

  try {
    const response = await $fetch('/api/cancel-eur-withdrawal', {
      method: 'POST',
      body: { requestId }
    });

    if (response.success) {
      // Remove the cancelled request from the list
      pendingEurWithdrawals.value = pendingEurWithdrawals.value.filter(
        item => item.id !== requestId
      );

      // Show success message (you might want to use a toast/notification system)
      console.log('Withdrawal request cancelled successfully');
      // TODO: Replace with proper toast notification
      // toast.success($t('history.wallet.withdrawal.cancelSuccess'));
    }
  } catch (error) {
    console.error('Error cancelling withdrawal:', error);
    // Show error message (you might want to use a toast/notification system)
    alert('Failed to cancel withdrawal request. Please try again.');
    // TODO: Replace with proper toast notification  
    // toast.error($t('history.wallet.withdrawal.cancelError'));
  } finally {
    cancellingId.value = null;
  }
};

// Watch for changes in pendingEurWithdrawals to update loading state
watch(() => pendingEurWithdrawals.value, () => {
  isLoading.value = false;
});

// Expose function to refresh pending withdrawals (can be called from parent component)
defineExpose({
  refreshPendingWithdrawals: fetchPendingEurWithdrawals
});

// Start the dots animation on mount and fetch pending withdrawals
onMounted(() => {
  interval = setInterval(() => {
    dots.value = dots.value.length >= 3 ? '' : dots.value + '.';
  }, 500);

  fetchPendingEurWithdrawals();
});

// Clean up the interval on component unmount
onUnmounted(() => {
  clearInterval(interval);
});

// Helper function to get the currency symbol
const getCurrencySymbol = (currency) => {
  switch (currency) {
    case 'EUR':
      return '€';
    case 'BTC':
      return '₿';
    case 'USDC':
      return '$';
    default:
      return '';
  }
};

// Helper function to get the icon name for each currency
const getIconName = (symbol) => {
  switch (symbol) {
    case 'BTC':
      return "token-branded:bitcoin";
    case 'EUR':
      return "circle-flags:european-union";
    case 'USDC':
      return "token-branded:usdc";
    case 'ETH':
      return "logos:ethereum";
    case 'TRX':
      return "token-branded:tron";
    case 'ETH_TEST5':
      return "logos:ethereum";
    case 'BTC_TEST':
      return "token-branded:bitcoin";
    case 'TRX_TEST':
      return "token-branded:tron";
    default:
      return "logos:ethereum";
  }
};

// Helper function to format date strings
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};
</script>
