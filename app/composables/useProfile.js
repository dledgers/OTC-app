export default async function () {
	const { data: res } = await useFetch("/api/profile");
	return res.value;
}
