// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	modules: [
		"@nuxtjs/i18n",
		"@nuxtjs/seo",
		"@nuxtjs/supabase",
		"@vite-pwa/nuxt",
		"@nuxtjs/color-mode",
		"@nuxt/icon",
	],
	icon: {
		mode: "css",
		cssLayer: "base",
	},
	i18n: {
		locales: [
			{ code: "en", name: "English", file: "en.json" },
			{ code: "es", name: "Spanish", file: "es.json" },
		],
		bundle: {
			optimizeTranslationDirective: false,
		},
		detectBrowserLanguage: false,
		strategy: "prefix",
		defaultLocale: "es",
	},
	vite: {
		plugins: [tailwindcss()],
	},
	css: ["~/assets/app.css"],
	pwa: {
		/* PWA options */
		client: {
			installPrompt: true,
		},
		registerType: "autoUpdate",
		injectRegister: "auto",
		includeAssets: [
			"favicon.ico",
			"apple-touch-icon-180x180.png",
			"maskable-icon-512x512.png",
		],
		manifest: {
			name: "Digitaledgers",
			short_name: "digitaledgers",
			description: "Digitaledgers - Manage your digital assets",
			theme_color: "#000000",
			orientation: "portrait",
			background_color: "#000000",
			display: "standalone",
			icons: [
				{
					src: "pwa-192x192.png",
					sizes: "192x192",
					type: "image/png",
				},
				{
					src: "pwa-512x512.png",
					sizes: "512x512",
					type: "image/png",
				},
			],
		},
		devOptions: {
			enabled: false,
		},
	},

	colorMode: {
		preference: "system", // default theme
		dataValue: "theme", // activate data-theme in <html> tag
		classSuffix: "",
	},

	supabase: {
		url: process.env.SUPABASE_URL,
		key: process.env.SUPABASE_KEY,
		serviceKey: process.env.SUPABASE_SERVICE_KEY,
		redirectOptions: {
			exclude: [
				"/apply",
				"/login",
				"/en/apply",
				"/en/login",
				"/es/apply",
				"/es/login",
			],
			login: "/login",
			callback: "/",
		},
	},
	site: {
		indexable: false,
		url: "https://app.digitaledgers.com",
		name: "Digitaledgers",
	},
	pages: true,
	runtimeConfig: {
		resendApiKey: process.env.RESEND_API_KEY,
		environment: process.env.ENVIRONMENT,
		aquanowApiKey: process.env.AQUANOW_API_KEY,
		aquanowApiSecret: process.env.AQUANOW_API_SECRET,
		aquanowAccountId: process.env.AQUANOW_ACCOUNT_ID,
		aquanowTradeUrl: process.env.AQUANOW_TRADE_URL,
		aquanowMarketUrl: process.env.AQUANOW_MARKET_URL,
		eisenTransferUrl: process.env.EISEN_TRANSFER_URL,
		ftlApiKey: process.env.FTL_API_KEY,
		cexioApiKey: process.env.CEXIO_API_KEY,
		cexioApiSecret: process.env.CEXIO_API_SECRET,
		cexioUrl: process.env.CEXIO_URL,
	},
});
