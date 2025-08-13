export default async function () {
	const { data: res } = await useFetch(`/api/cex-market`);
	return res.value;
}
