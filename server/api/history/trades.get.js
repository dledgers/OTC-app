import { serverSupabaseClient } from "#supabase/server";
export default eventHandler(async (event) => {
	const client = await serverSupabaseClient(event);
	let { data, error } = await client
		.from("cex_trades")
		.select(
			`
			transact_time,
			currency_1,
			executed_amount_ccy_1,
			currency_2,
			executed_amount_ccy_2,
			fee_amount,
			order_id,
			side
		`
		)
		.order("transact_time", { ascending: false });
	if (error) {
		throw createError({
			statusCode: 400,
			statusMessage: error.message,
		});
	}
	// Map the data to match the old response shape
	const mapped = data.map((row) => ({
		created_at: row.transact_time,
		deliver_currency: row.currency_1,
		deliver_quantity: row.executed_amount_ccy_1,
		receive_currency: row.currency_2,
		receive_quantity: row.executed_amount_ccy_2,
		fee: row.fee_amount,
		pair: `${row.currency_1}/${row.currency_2}`,
		order_id: row.order_id,
		trade_side: row.side?.toLowerCase(),
	}));
	return mapped;
});
