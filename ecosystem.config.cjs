module.exports = {
	apps: [
		{
			name: "OTC application",
			port: "3000",
			instances: "max",
			script: "./.output/server/index.mjs",
			cwd: __dirname,
			env: {
				NODE_ENV: "production",
				NITRO_PRESET: "node-server",
			},
		},
	],
};
