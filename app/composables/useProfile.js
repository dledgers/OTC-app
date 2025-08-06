export default async function () {
	const res = await $fetch("/api/profile", {
		method: "GET",
	});
	return res;
}
