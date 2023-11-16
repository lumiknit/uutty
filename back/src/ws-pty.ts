import { spawn } from "node-pty";
import WebSocket from "ws";

export const spawnPtyOnSocket = (socket: WebSocket) => {
	const DISCONNECT_TIMEOUT = 60000;
	let lastPing = Date.now();
	let disconnectCheckInterval = setInterval(() => {
		if (Date.now() - lastPing > DISCONNECT_TIMEOUT) {
			console.log("[!] Disconnecting due to timeout");
			socket.close();
			clearInterval(disconnectCheckInterval);
		}
	}, 20000);

	const id = Math.random().toString(36).slice(2);
	console.log("[+] New connection: " + id);
	const pty = spawn("bash", [], {
		name: "xterm-color",
		cols: 80,
		rows: 30,
		cwd: process.env.HOME,
		env: process.env,
	});
	pty.onData(data => {
		console.log(`[${id} <-] ${data}`);
		socket.send(data);
	});
	pty.onExit(() => {
		console.log(`[${id} !] exit`);
		socket.close();
	});
	socket.on("message", (rawData: WebSocket.RawData) => {
		console.log("RAW", rawData);
		const s = rawData.toString();
		// Reset disconnect timeout
		lastPing = Date.now();
		// First character is the control character
		const cc = s.charAt(0);
		// Rest is the data
		const data = s.slice(1);
		console.log(`[${id} ->] ${cc}: ${data}`);
		switch (cc) {
			case ".": {
				// Ping
				break;
			}
			case "k": {
				// Kill
				pty.kill();
				break;
			}
			case "r": {
				// Resize
				const [cols, rows] = data.split(",").map(Number);
				pty.resize(cols, rows);
				break;
			}
			case "w": {
				// Write
				pty.write(data);
				break;
			}
		}
	});
};
