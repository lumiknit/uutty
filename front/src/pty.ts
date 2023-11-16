export const getWebSocketURL = () => {
	// Get path such that ws://<CURRENT_PATH>/ws
	return window.location.href
		.replace(/^http/, "ws")
		.replace(/\/(index.html|assets\/.*)?$/, "/ws");
};

export type WebSocketCallbacks = {
	onOpen?: () => void;
	onMessage?: (e: MessageEvent) => void;
	onClose?: () => void;
	onError?: () => void;
};

export const openWebSocket = (
	url: string,
	callbacks: WebSocketCallbacks,
): WebSocket => {
	// Replace subpath to websocket
	const ws = new WebSocket(url);
	let pingInterval: number = 0;

	// Set callbacks
	ws.onopen = e => {
		console.log("[*] Open", e);
		callbacks.onOpen?.();
		pingInterval = setInterval(() => {
			ws.send(".");
		}, 10000);
	};
	ws.onmessage = (e: MessageEvent) => {
		console.log("[->]", e);
		callbacks.onMessage?.(e);
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
