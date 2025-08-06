import {
	serverSupabaseClient,
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

const runtimeConfig = useRuntimeConfig();

export default eventHandler(async (event) => {
	const client = await serverSupabaseClient(event);
	const admin = serverSupabaseServiceRole(event);
	const user = serverSupabaseUser(event);

	// Convert June 10, 2025 to different formats for different tables
	const june10Date = "2025-06-15"; // For tables with timestamp/date columns
	const june10Timestamp = new Date("2025-06-15").getTime(); // For tables with bigint timestamps

	let { data, error } = await client
		.from("cex_transactions")
		.select("*")
		.gte("created_at", june10Date)
		.order("created_at", { ascending: false });

	if (error) {
		throw createError({
			statusCode: 400,
			statusMessage: error.message,
		});
	}

	console.log("All CEX Transactions:", data);
	console.log("CEX Transactions found:", data?.length);

	let { data: profileData, error: profileError } = await client
		.from("profiles")
		.select("btc_address, eth_address, trx_address, company_id");

	if (profileError) {
		console.error("Profile data error", profileError);
		return { confirmed: data, unConfirmed: false };
	}

	// Add new query for bank accounts
	let { data: bankAccountsData, error: bankAccountError } = await admin
		.from("bank_accounts")
		.select("*")
		.eq("company_id", profileData[0]?.company_id);

	if (bankAccountError) {
		console.error("Bank accounts data error", bankAccountError);
		return { confirmed: data, unConfirmed: false };
	}

	const btcAddress = profileData[0]?.btc_address;
	const ethAddress = profileData[0]?.eth_address;
	const trxAddress = profileData[0]?.trx_address;

	// Filter Fireblocks webhooks by destination address matching user's addresses
	let { data: fireblocksWebhooksData, error: fireblocksError } = await admin
		.from("fireblocks_webhook")
		.select("*")
		.or(
			`destination_address.eq.${btcAddress},destination_address.eq.${ethAddress},destination_address.eq.${trxAddress}`
		)
		.gte("created_at", june10Timestamp)
		.order("created_at", { ascending: false });

	if (fireblocksError) {
		console.error("Fireblock data error:", fireblocksError);
		return { confirmed: data, unConfirmed: false };
	}

	let { data: ftlData, error: ftlError } = await admin
		.from("ftl_webhooks")
		.select("*")
		.gte("timestamp", june10Date);

	if (ftlError) {
		console.error("ftl_webhooks data error:", ftlError);
		return { confirmed: data, unConfirmed: false };
	}

	console.log("ftlData", ftlData);

	const unConfirmed = await getUnconfirmedDeposits(
		profileData,
		fireblocksWebhooksData,
		data,
		ftlData,
		bankAccountsData
	);

	return { confirmed: data, unConfirmed: unConfirmed };
});

async function getUnconfirmedDeposits(
	profileData,
	fireblocksData,
	cexTransactions,
	ftlData,
	bankAccountsData
) {
	const environment = runtimeConfig.environment;
	const companyId = profileData[0]?.company_id;
	const unconfirmed = {};

	// Group Fireblocks transactions by asset
	const fireblocksTransactionsByAsset = {};
	fireblocksData
		.filter(
			(fb) =>
				fb.status === "COMPLETED" && fb.amount && !fb.asset_id.includes("NFT")
		)
		.forEach((fb) => {
			let symbol = fb.asset_id;
			if (environment === "dev") {
				symbol = symbol.replace(/_TEST\d*$/, "");
			}
			if (symbol.startsWith("USDT_")) {
				symbol = "USDT";
			}

			fireblocksTransactionsByAsset[symbol] =
				fireblocksTransactionsByAsset[symbol] || [];
			fireblocksTransactionsByAsset[symbol].push(fb);
		});

	// For each asset, compare counts and take latest excess transactions
	Object.entries(fireblocksTransactionsByAsset).forEach(([symbol, fbTxs]) => {
		const cexCount = cexTransactions.filter(
			(tx) =>
				tx.currency === symbol &&
				tx.direction === "deposit" &&
				tx.status === "approved"
		).length;

		const fireblocksCount = fbTxs.length;

		if (fireblocksCount > cexCount) {
			// Sort by created_at in descending order
			const sortedFbTxs = fbTxs.sort(
				(a, b) => new Date(b.created_at) - new Date(a.created_at)
			);

			// Take the difference in count from the latest transactions
			const excessCount = fireblocksCount - cexCount;
			unconfirmed[symbol] = sortedFbTxs.slice(0, excessCount).map((fb) => ({
				...fb,
				company_id: companyId,
			}));
		}
	});

	// Handle fiat (EUR) deposits from FTL
	const ftlConfirmedDeposits = ftlData.filter(
		(ftl) =>
			ftl.state === "Executed" &&
			bankAccountsData.some((ba) => ba.account_number === ftl.account_number)
	);

	// Check each FTL deposit against cex_transactions
	ftlConfirmedDeposits.forEach((ftl) => {
		const isConfirmed = cexTransactions.some(
			(tx) =>
				(tx.blockchain_tx_id &&
					(tx.blockchain_tx_id.includes(ftl.internal_transfer_id?.toString()) ||
						tx.blockchain_tx_id.includes(ftl.payment_id?.toString()))) ||
				(tx.tx_id &&
					(tx.tx_id.includes(ftl.internal_transfer_id?.toString()) ||
						tx.tx_id.includes(ftl.payment_id?.toString())))
		);

		if (!isConfirmed) {
			const symbol = ftl.currency;
			unconfirmed[symbol] = unconfirmed[symbol] || [];
			unconfirmed[symbol].push({
				amount: ftl.payment_amount,
				created_at: ftl.timestamp,
				ftl_details: {
					...ftl,
					bank_account: bankAccountsData.find(
						(ba) => ba.account_number === ftl.account_number
					),
				},
				company_id: companyId,
			});
		}
	});

	return Object.keys(unconfirmed).length === 0 ? [] : unconfirmed;
}
