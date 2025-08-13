export default async function (symbol, precision) {
	const { data: res } = await useFetch(
		`/api/market?symbol=${symbol}&precision=${precision}`
	);
	return res.value;
}
