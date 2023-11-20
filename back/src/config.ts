import * as os from "node:os";
import * as fs from "node:fs";

import yargs from "yargs";

export type NoAuthConfig = {
	type: "none";
};

export type BasicAuthConfig = {
	type: "basic";
	username: string;
	password: string;
};

export type AuthConfig = NoAuthConfig | BasicAuthConfig;

export type ThemeConfig = {
	fontFamily: string;
	fontSize: number;
	fg: string;
	bg: string;
	cursor: string;
	selection: string;
	ansi: string[];
	// Options
	tableBuffer?: boolean;
};

export type ClientConfig = {
	themes: ThemeConfig[];
};

export type Config = {
	// Connection config
	host: string;
	port: number;
	auth: AuthConfig;
	// Server config
	staticPath: string;
	shell: string;
	cwd: string;
	env: { [key: string]: string | undefined };
} & ClientConfig;

const defaultShell = (): string => {
	switch (os.platform()) {
		case "win32":
			return "powershell.exe";
		case "darwin":
			return "zsh";
		default:
			return "bash";
	}
};

export const defaultConfig = (): Config => ({
	host: "0.0.0.0",
	port: 3000,
	auth: {
		type: "none",
	},
	staticPath: "../front-dist",
	shell: defaultShell(),
	cwd: os.homedir(),
	env: {
		TERM: "xterm-256color",
	},
	themes: [
		{
			fontFamily: "'Iosevka QP Lumi', sans-serif",
			fontSize: 14,
			fg: "#ffffff",
			bg: "#000000",
			cursor: "#ffffff",
			selection: "#000000",
			ansi: [
				"#000000",
				"#ff0000",
				"#00ff00",
				"#ffff00",
				"#0000ff",
				"#ff00ff",
				"#00ffff",
				"#ffffff",
				"#808080",
				"#ff0000",
				"#00ff00",
				"#ffff00",
				"#0000ff",
				"#ff00ff",
				"#00ffff",
				"#ffffff",
			],
			tableBuffer: true,
		},
	],
});

export const getClientConfig = (config: ClientConfig): ClientConfig => ({
	themes: config.themes,
});

// --- CLI ---

yargs.version("0.0.2");

yargs.option("config", {
	alias: "c",
	describe: "Path to config json file",
	type: "string",
});

yargs.option("host", {
	alias: "h",
	describe: "Host to listen on",
	type: "string",
});

yargs.option("port", {
	alias: "p",
	describe: "Port to listen on",
	type: "number",
});

yargs.option("auth", {
	alias: "a",
	describe: "Authentication method",
	choices: ["none", "basic"],
	type: "string",
});

yargs.option("username", {
	alias: "u",
	describe: "Username for basic auth",
	type: "string",
});

yargs.option("password", {
	alias: "P",
	describe: "Password for basic auth",
	type: "string",
});

yargs.option("static", {
	describe: "Path to static files",
	type: "string",
});

yargs.option("shell", {
	alias: "s",
	describe: "Shell to use",
	type: "string",
});

yargs.option("cwd", {
	alias: "d",
	describe: "Current working directory",
	type: "string",
});

yargs.option("env", {
	alias: "e",
	describe: "Environment variables",
	type: "string",
});

export const parseArgs = (): Config => {
	const config = defaultConfig();
	// Load from args
	const parsed = yargs.parseSync();
	// Copy over
	Object.assign(config, parsed);
	// Load from file
	if (parsed.config) {
		const content = fs.readFileSync(parsed.config as string, "utf-8");
		// Parse json
		const fileConfig = JSON.parse(content);
		Object.assign(config, fileConfig);
	}
	return config;
};
