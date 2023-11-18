// API

import { getAPIURL } from "./utils/url";

const getAuthToken = async () => {
	const url = getAPIURL("http", "/token");
	const res = await fetch(url);
	return res.text();
};

// WebSocket

export const getWebSocketURL = () => getAPIURL("ws", "/ws");

export type WebSocketCallbacks = {
	onOpen?: () => void;
	onMessage?: (e: string) => void;
	onClose?: () => void;
	onError?: () => void;
};

export const openWebSocket = async (
	url: string,
	callbacks: WebSocketCallbacks,
): Promise<WebSocket> => {
	const token = await getAuthToken();

	// Replace subpath to websocket
	const ws = new WebSocket(url);
	let pingInterval: number = 0;

	// Set callbacks
	ws.onopen = e => {
		console.log("[*] Open", e);
		callbacks.onOpen?.();
		ws.send("-" + token);
		pingInterval = setInterval(() => {
			ws.send(".");
		}, 10000);
	};
	ws.onmessage = (e: MessageEvent) => {
		console.log("[->]", e);
		callbacks.onMessage?.(e.data);
	};
	ws.onclose = e => {
		console.log("[!] Close", e);
		callbacks.onClose?.();
		clearInterval(pingInterval);
	};
	ws.onerror = e => {
		console.log("[?] Error", e);
		callbacks.onError?.();
	};
	return ws;
};
