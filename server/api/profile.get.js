import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
export default eventHandler(async (event) => {
	const client = await serverSupabaseClient(event);
	const user = await serverSupabaseUser(event);
	let { data, error } = await client
		.from("profiles")
		.select(
			"tg_id, btc_balance, usdc_balance, eur_balance, btc_address, eth_address, trx_address, eth_balance, trx_balance"
		);
	if (error) {
		throw createError({
			statusCode: 400,
			statusMessage: error.message,
		});
	}
	return data;
});
