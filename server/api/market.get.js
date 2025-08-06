import { serverSupabaseClient } from "#supabase/server";
export default eventHandler(async (event) => {
	const client = await serverSupabaseClient(event);
	const query = getQuery(event);
	try {
		const data = await getMarketBestPrice(query.symbol, query.precision);
		return data;
	} catch (error) {
		throw createError({
			statusCode: 400,
			statusMessage: error.message,
		});
	}
});
