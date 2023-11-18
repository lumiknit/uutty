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
	return (
		<>
			<Show when={state() !== undefined}>
				<Term
					state={state()!.state}
					onInput={data => {
						console.log("Inputted:", data);
						state()?.ws.send("w" + data);
					}}
					onResize={(cols, rows) => {
						// Check original size
						const s = state();
						const buf = s!.state.buffer[0]();
						if (buf.size[0] === rows && buf.size[1] === cols)
							return;
						console.log("Resized:", cols, rows);
						termState.resize(s!.state, cols, rows);
						state()?.ws.send(`r${cols},${rows}`);
					}}
				/>
			</Show>
		</>
	);
};
