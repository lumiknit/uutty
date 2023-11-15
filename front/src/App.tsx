import "./App.css";

const sendWebsocket = () => {
	// Get path such that ws://<CURRENT_PATH>/ws
	const path = window.location.href
		.replace(/^http/, "ws")
	.replace(/\/(index.html|assets\/.*)?$/, "/ws");
	console.log(path);
	// Replace subpath to websocket
	const ws = new WebSocket(path);
	// Send message to websocket
	ws.onopen = () => ws.send("Hello");
	// Log message from websocket
	ws.onmessage = (e) => console.log(e.data);
};

export default () =>  {
	return <>
		<button onClick={sendWebsocket}>Hello</button>
	</>;
};