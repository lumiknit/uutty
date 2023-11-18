import { Show, createSignal, onMount } from "solid-js";
import "./App.css";
import Term from "./components/Term";
import { ClientConfig, getRemoteConfig } from "./utils/config";
import * as termState from "./components/term-state";
import { getWebSocketURL, openWebSocket } from "./pty";

export type State = {
	config: ClientConfig;
	state: termState.TermState;
	ws: WebSocket;
};

export default () => {
	const [state, setState] = createSignal<State | undefined>();
	let canvasRef: HTMLCanvasElement | undefined;
	onMount(async () => {
		const config = await getRemoteConfig();
		const state = termState.newTermState(config);
		const ws = await openWebSocket(getWebSocketURL(), {
			onOpen: () => {
				console.log("[open]");
			},
			onMessage: (data: string) => {
				console.log("[msg]", data);
				termState.putData(state, data);
			},
			onClose: () => {
				console.log("[close]");
			},
			onError: () => {
				console.log("[error]");
			},
		});
		setState({
			config,
			state,
			ws,
		});
	});
	window.addEventListener("resize", () => {
		const mx = 10,
			my = 10;
		const w = window.innerWidth - 2 * mx;
		const h = window.innerHeight - 2 * my;
		// Get 'M' character's width and height
		const s = state();
		const theme = s!.config.themes[s!.state.theme[0]()];
		const canvas = canvasRef!;
		const ctx = canvas.getContext("2d")!;
		ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
		const metrics = ctx.measureText("M");
		const charWidth = metrics.width;
		const charHeight = metrics.actualBoundingBoxAscent;
		// Calculate new terminal size
		const cols = Math.floor(w / charWidth);
		const rows = Math.floor(h / charHeight);
		// Resize
		// Check original size
		const buf = s!.state.buffer[0]();
		if (buf.size[0] === rows && buf.size[1] === cols) return;
		console.log("Resized:", cols, rows);
		termState.resize(s!.state, cols, rows);
		state()?.ws.send(`r${cols},${rows}`);
	});
	return (
		<>
			<Show when={state() !== undefined}>
				<Term
					state={state()!.state}
					onInput={data => {
						console.log("Inputted:", data);
						state()?.ws.send("w" + data);
					}}
				/>
			</Show>
			<canvas ref={canvasRef} class="uutty-dummy-canvas" />
		</>
	);
};
