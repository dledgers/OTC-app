import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
export default eventHandler(async (event) => {
	const client = await serverSupabaseClient(event);
	const user = await serverSupabaseUser(event);
	let { data, error } = await client
		.from("autopilot")
		.select(
			"deposited_currency, convert_currency, network, withdraw_to, active, auto_withdraw"
		);
	if (error) {
		throw createError({
			statusCode: 400,
			statusMessage: error.message,
		});
	}
	return data;
});
