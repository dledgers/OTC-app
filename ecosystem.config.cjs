module.exports = {
	apps: [
		{
			name: "OTC application",
			port: "3000",
			instances: "max",
			script: "./.output/server/index.mjs",
			env: {
				NODE_ENV: "production",
			},
		},
	],
};
