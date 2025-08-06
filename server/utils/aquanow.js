import CryptoJS from "crypto-js";
const runtimeConfig = useRuntimeConfig();

async function requestAquanow(endpoint, httpMethod, data, type = "body") {
	const apiKey = runtimeConfig.aquanowApiKey;
	const apiSecret = runtimeConfig.aquanowApiSecret;
	const nonce = Date.now().toString();

	const signatureContent = JSON.stringify({
		httpMethod,
		path: endpoint,
		nonce,
	});

	const sig = CryptoJS.HmacSHA384(signatureContent, apiSecret).toString(
		CryptoJS.enc.Hex
	);

	try {
		if (type === "body") {
			//Placing trades and withdrawals requests here
			const res = await $fetch(`${runtimeConfig.aquanowTradeUrl}${endpoint}`, {
				method: httpMethod,
				headers: {
					"Content-Type": "application/json",
					"x-nonce": nonce,
					"x-api-key": apiKey,
					"x-signature": sig,
				},
				maxRedirects: 20,
				body: data,
			});
			return res;
		} else if (type === "params") {
			// Getting marketing data here
			const res = await $fetch(
				`${runtimeConfig.aquanowMarketUrl}${endpoint}?symbol=${data.symbol}&precision=${data.precision}`,
				{
					method: httpMethod,
					headers: {
						"x-nonce": nonce,
						"x-api-key": apiKey,
						"x-signature": sig,
					},
				}
			);
			return res;
		}
	} catch (e) {
		console.log("AQUANOW UTIL ERROR:", {
			message: e.message,
			status: e.status,
			statusCode: e.statusCode,
			data: e.data,
			endpoint: endpoint,
			method: httpMethod,
			timestamp: new Date().toISOString(),
		});
		throw createError({
			statusCode: 400,
			statusMessage: "Aquanow API Error",
		});
	}
}

export async function placeMarketTrade(amt, pair, side) {
	console.log("Trade", parseFloat(amt), pair);
	const data = {
		ticker: pair,
		accountId: runtimeConfig.aquanowAccountId,
		tradeSide: side, //sell
		deliverQuantity: parseFloat(amt), //receiveQuantity is the alternative for using how much eur to get
	};
	return await requestAquanow("/trades/v1/market", "POST", data);
}

export async function requestRFQQuote(amt, pair, side) {
	console.log("Trade", parseFloat(amt), pair);
	const data = {
		ticker: pair,
		accountId: runtimeConfig.aquanowAccountId,
		tradeSide: side, //sell
		deliverQuantity: parseFloat(amt), //receiveQuantity is the alternative for using how much eur to get
	};
	return await requestAquanow("/trades/v1/createQuote", "POST", data);
}

export async function executeRFQQuote(id) {
	console.log("EXECUTE RFQ", id);
	const data = {
		quoteId: id,
	};
	return await requestAquanow("/trades/v1/executeQuote", "POST", data);
}

export async function expireRFQQuote(id) {
	console.log("EXPIRE RFQ", id);
	const data = {
		quoteId: id,
	};
	return await requestAquanow("/trades/v1/expireQuote", "PUT", data);
}

export async function withdrawCrypto(amt, crypto, address, network = null) {
	console.log(
		"Withdraw",
		parseFloat(amt),
		crypto,
		address,
		network,
		runtimeConfig.aquanowAccountId
	);
	const data = {
		symbol: crypto,
		address: address,
		transactionType: "WITHDRAW",
		accountId: runtimeConfig.aquanowAccountId,
		grossQuantity: parseFloat(amt),
	};

	// Add the network property to the data object only if it has a value
	if (network) {
		data.networkType = network;
	}
	console.log("Withdraw data", data);

	return await requestAquanow("/accounts/v1/transaction", "POST", data);
}

export async function getMarketBestPrice(pair, precision = 2) {
	const data = {
		symbol: pair,
		precision: precision,
	};
	return await requestAquanow(`/v2/bestprice`, "GET", data, "params");
}
