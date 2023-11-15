import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [solid()],
	build: {
		outDir: "../front-dist",
		emptyOutDir: true,
	},
});
