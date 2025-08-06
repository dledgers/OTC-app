import { serverSupabaseUser } from "#supabase/server";

export default eventHandler(async (event) => {
	const user = await serverSupabaseUser(event);
	try {
		const data = await getCexRates();
		return data;
	} catch (error) {
		throw createError({
			statusCode: 400,
			statusMessage: error.message,
		});
	}
});
