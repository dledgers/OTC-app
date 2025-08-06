export default async function (symbol, precision) {
	const res = await $fetch(
		`/api/market?symbol=${symbol}&precision=${precision}`,
		{
			method: "GET",
		}
	);
	return res;
}
