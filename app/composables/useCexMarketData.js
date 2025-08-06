export default async function () {
	const res = await $fetch(`/api/cex-market`);
	return res;
}
