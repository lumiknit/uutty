export const getAPIURL = (protocol: string, path: string) => {
	// e.g. getAPIURL("http", "/healthz")
	return window.location.href
		.replace(/^http/, protocol)
		.replace(/\/(index.html|assets\/.*)?$/, path);
};
