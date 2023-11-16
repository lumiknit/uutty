import { getAPIURL } from "./url";

export type ThemeConfig = {
	fontFamily: string;
	fg: string;
	bg: string;
	cursor: string;
	selection: string;
	ansi: string[];
};

export type ClientConfig = {
	themes: ThemeConfig[];
};

export const getRemoteConfig = async (): Promise<ClientConfig> => {
	const url = getAPIURL("http", "/config");
	const res = await fetch(url);
	return res.json();
};
