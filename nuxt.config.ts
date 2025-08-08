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
		"nuxt-security",
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
		langDir: "locales",
		defaultLocale: "es",
		strategy: "prefix",
		detectBrowserLanguage: false,
		bundle: {
			runtimeOnly: false,
			compositionOnly: false,
			fullInstall: false,
			dropMessageCompiler: false,
		},
		compilation: {
			strictMessage: false,
		},
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
				"/mfa-verify",
				"/en/apply",
				"/en/login",
				"/en/mfa-verify",
				"/es/apply",
				"/es/login",
				"/es/mfa-verify",
			],
			login: "/es/login",
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
		cloudflareSecretKey: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
		public: {
			cloudflareSiteKey: process.env.CLOUDFLARE_TURNSTILE_SITE_KEY,
		},
	},
	security: {
		// Comprehensive security configuration optimized for Supabase integration
		// Allows file uploads, authentication flows, and external email resources
		headers: {
			contentSecurityPolicy: {
				"base-uri": ["'self'"],
				"font-src": [
					"'self'",
					"data:",
					"https://fonts.googleapis.com",
					"https://fonts.gstatic.com",
				],
				"form-action": ["'self'"],
				"frame-ancestors": ["'none'"],
				"frame-src": [
					"'self'",
					"https://challenges.cloudflare.com", // For Cloudflare Turnstile widget
				],
				"img-src": [
					"'self'",
					"data:", // For QR codes and other data URLs
					"blob:", // For blob URLs
					"https:",
					"*.supabase.co", // For Supabase storage
					"*.amazonaws.com", // For email template images
				],
				"connect-src": [
					"'self'",
					"*.supabase.co", // For Supabase API calls including MFA
					"wss://*.supabase.co", // For Supabase realtime
					"https://challenges.cloudflare.com", // For Cloudflare Turnstile
					"https://eyhkkuzspchiyqrqjyjk.supabase.co", // Explicit Supabase project URL
				],
				"object-src": ["'none'"],
				"script-src-attr": ["'none'"],
				"style-src": [
					"'self'",
					"'unsafe-inline'", // Required for Nuxt/Vue and inline SVG styles
					"data:", // For inline SVG styles in QR codes
					"https://fonts.googleapis.com",
				],
				"script-src": [
					"'self'",
					"'unsafe-inline'", // Required for Nuxt
					"'unsafe-eval'", // Required for dev mode
					"https://challenges.cloudflare.com", // For Cloudflare Turnstile
				],
				"upgrade-insecure-requests": true,
			},
			crossOriginEmbedderPolicy: "unsafe-none", // Allow cross-origin resources
			crossOriginOpenerPolicy: "same-origin-allow-popups", // Allow popups for document viewing
			crossOriginResourcePolicy: "cross-origin", // Allow cross-origin resources
			referrerPolicy: "no-referrer",
			strictTransportSecurity: {
				maxAge: 31536000,
				includeSubdomains: true,
				preload: true,
			},
			xContentTypeOptions: "nosniff",
			xDNSPrefetchControl: "off",
			xDownloadOptions: "noopen",
			xFrameOptions: "DENY",
			xPermittedCrossDomainPolicies: "none",
			xXSSProtection: "1; mode=block",
		},
		// Rate limiting for API endpoints - permissive for file operations
		rateLimiter: {
			tokensPerInterval: 200, // Increased for file uploads and batch operations
			interval: "hour",
			headers: true,
			driver: {
				name: "lruCache",
			},
			throwError: true,
		},
		// Request size limiting
		requestSizeLimiter: {
			maxRequestSizeInBytes: 20000000, // 2MB
			maxUploadFileRequestInBytes: 80000000, // 8MB
			throwError: true,
		},
		// XSS protection
		xssValidator: {
			throwError: true,
			methods: ["GET", "POST", "PUT", "DELETE"],
		},
		// CORS - allow same-origin and Supabase domains for auth flows
		corsHandler: {
			origin: [
				"https://app.digitaledgers.com", // Your app domain
				"*.supabase.co", // Allow Supabase auth flows
			],
			methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
			preflight: {
				statusCode: 204,
			},
		},
		// Additional security measures
		allowedMethodsRestricter: {
			methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
			throwError: true,
		},
		hidePoweredBy: true,
		basicAuth: false,
		enabled: true,
		csrf: false, // Disabled due to existing robust auth restrictions
		nonce: true,
		removeLoggers: {
			external: [],
			consoleType: ["log", "debug"],
			include: [/\.[jt]sx?$/, /\.vue\??/],
			exclude: [/node_modules/, /\.git/],
		},
		ssg: {
			meta: true,
			hashScripts: true,
			hashStyles: false,
		},
		sri: true,
	},
});
