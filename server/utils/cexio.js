import crypto from "crypto";
const runtimeConfig = useRuntimeConfig();

async function requestCex(endpoint, httpMethod, data) {
	const apiKey = runtimeConfig.cexioApiKey;
	const apiSecret = runtimeConfig.cexioApiSecret;

	const timestamp = parseInt(Date.now() / 1000);
	const payload = endpoint + timestamp + JSON.stringify(data);
	const signature = crypto
		.createHmac("sha256", apiSecret)
		.update(payload)
		.digest("base64");
	console.log("CEX Data", data);
	try {
		console.log("STARTING CEX REQUEST");
		//Placing trades and withdrawals requests here
		const res = await $fetch(`${runtimeConfig.cexioUrl}${endpoint}`, {
			method: httpMethod,
			headers: {
				"X-AGGR-KEY": apiKey,
				"X-AGGR-TIMESTAMP": timestamp,
				"X-AGGR-SIGNATURE": signature,
				"Content-Type": "application/json",
			},
			maxRedirects: 20,
			body: data,
		});

		console.log("CEX RESPONSE", res);
		return res;
	} catch (e) {
		console.log("CEX UTIL ERROR:", e.message);
		console.log("CEX UTIL ERROR:", e.statusMessage);
		console.log("CEX UTIL ERROR:", e.data);

		throw createError({
			statusCode: 400,
			statusMessage: e.data.error,
		});
	}
}

export async function withdrawCex({ currency, amount, address }) {
	const method = "POST";
	const endpoint = "do_withdrawal_funds";
	const data = {
		clientTxId: "TX" + Math.floor(Math.random() * 1000000000),
		currency: currency,
		amount: Number(amount).toFixed(6).toString(),
		instrument: "crypto",
		accountId: "OTC",
		blockchain: currency === "BTC" ? "bitcoin" : "ethereum",
		parameters: {
			address: address,
		},
	};
	console.log("CEX WITHDRAWAL DATA", data);
	return await requestCex(endpoint, method, data);
}

export async function cexPlaceMarketOrder({
	side,
	currency1,
	currency2,
	amount,
	userId,
}) {
	const method = "POST";
	const endpoint = "do_my_new_order";
	const data = {
		accountId: "OTC",
		clientOrderId: "ORD" + Math.floor(Math.random() * 1000000000),
		currency1: currency1,
		currency2: currency2,
		side: side,
		timestamp: Date.now(),
		orderType: "Market",
		...(side === "SELL" ? { amountCcy1: amount } : { amountCcy2: amount }),
		comment: userId,
	};
	return await requestCex(endpoint, method, data);
}

export async function cexMarketOrderEstimate({
	side,
	currency,
	counterCurrency,
	amount,
}) {
	const method = "POST";
	const endpoint = "get_exchange_rate";
	const data = {
		side: side,
		accountId: "OTC",
		currency: currency,
		counterCurrency: counterCurrency,
		amount: amount,
	};
	return await requestCex(endpoint, method, data);
}

export async function getCexRates() {
	const method = "POST";
	const endpoint = "get_current_rates";
	const data = {
		pairs: [
			"BTC-USDC",
			"BTC-EUR",
			"ETH-BTC",
			"ETH-USDC",
			"ETH-EUR",
			"USDC-EUR",
		],
	};
	return await requestCex(endpoint, method, data);
}

export async function getTradeConditions(pairs) {
	//pairs is an array of pairs
	const method = "POST";
	const endpoint = "get_my_trading_conditions";
	const data = {
		pairs: pairs,
	};
	return await requestCex(endpoint, method, data);
}
