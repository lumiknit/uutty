import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [solid()],
	base: "",
	build: {
		outDir: "../front-dist",
		emptyOutDir: true,
		assetsInlineLimit: 1024 * 1024,
	},
	server: {
		proxy: {
			"/ws": {
				target: "ws://127.0.0.1:3000",
				ws: true,
			},
			"^/(config|token)": {
				target: "http://127.0.0.1:3000",
			},
		},
	},
});
