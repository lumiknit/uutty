import { Show, createSignal, onMount } from "solid-js";
import "./App.css";
import Term from "./components/Term";
import { ClientConfig, getRemoteConfig } from "./utils/config";
import { TermState, newTermState, putData } from "./components/term-state";
import { getWebSocketURL, openWebSocket } from "./pty";

export type State = {
	config: ClientConfig;
	state: TermState;
	ws: WebSocket;
};

export default () => {
	const [state, setState] = createSignal<State | undefined>();
	onMount(async () => {
		const config = await getRemoteConfig();
		const state = newTermState(config);
		const ws = await openWebSocket(getWebSocketURL(), {
			onOpen: () => {
				console.log("[open]");
			},
			onMessage: (data: string) => {
				console.log("[msg]", data);
				putData(state, data);
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
						console.log("OnInput", data);
						state()?.ws.send("w" + data);
					}}
				/>
			</Show>
		</>
	);
};
