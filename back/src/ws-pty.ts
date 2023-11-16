import { IPty, spawn } from "node-pty";
import WebSocket from "ws";
import { genRandomString } from "./utils";

// Auth
// Server randomly generates a token.
// Client should send the token in the first message.

let tokens: string[] = [];

const issueToken = () => {
	const token = genRandomString(64);
	tokens.push(token);
	return token;
};

issueToken();

export const getToken = () => {
	return tokens[0];
};

// Websocket-pty connection

const CONNECTION_CHECK_INTERVAL = 20000;

export const spawnPtyOnSocket = (socket: WebSocket) => {
	let lastPing = Date.now();
	let disconnectCheckInterval = setInterval(() => {
		if (Date.now() - lastPing > CONNECTION_CHECK_INTERVAL) {
			console.log("[!] Disconnecting due to timeout");
			socket.close();
			clearInterval(disconnectCheckInterval);
		}
	}, CONNECTION_CHECK_INTERVAL);

	const id = genRandomString(8);
	console.log("[+] New connection: " + id);

	let authorized = false;
	let pty: IPty | null = null;

	socket.on("close", () => {
		if (pty !== null) {
			pty.kill();
		}
	});

	socket.once("message", (rawData: WebSocket.RawData) => {
		// Authroize
		const s = rawData.toString();
		const cc = s.charAt(0);
		const data = s.slice(1);
		if (cc !== "-" || tokens.indexOf(data) < 0) {
			console.log(`[${id} !] Unauthorized`);
			socket.close();
			return;
		}
		// Create pty
		authorized = true;
		pty = spawn("bash", [], {
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
	});

	socket.on("message", (rawData: WebSocket.RawData) => {
		if (!authorized) return;
		const s = rawData.toString();
		lastPing = Date.now();
		const cc = s.charAt(0);
		const data = s.slice(1);
		console.log(`[${id} ->] ${cc}: ${data}`);
		switch (cc) {
			case ".": {
				// Ping
				break;
			}
			case "k": {
				// Kill
				pty!.kill();
				break;
			}
			case "r": {
				// Resize
				const [cols, rows] = data.split(",").map(Number);
				pty!.resize(cols, rows);
				break;
			}
			case "w": {
				// Write
				pty!.write(data);
				break;
			}
		}
	});
};
