import { Component, createEffect } from "solid-js";
import { getWebSocketURL, openWebSocket } from "../pty";
import { keyToEscape } from "../input/key";
import { inputDataToEscape } from "../input/input";

type TermProps = {};

const Term: Component<TermProps> = props => {
	let taRef: HTMLTextAreaElement | undefined;
	let ref: HTMLDivElement | undefined;
	let ws: WebSocket | undefined;

	const sendKey = (escaped: string) => {
		if (!ws) return;
		ws.send("w" + escaped);
	};

	// Create terminal
	createEffect(() => {
		if (!ref) return;
		console.log("Mounted");
		ws = openWebSocket(getWebSocketURL(), {
			onMessage: e => {
				ref!.innerText += e.data;
			},
		});
	});
	return (
		<>
			<div
				ref={ref}
				class="uutty-term"
				tabIndex={0}
				onClick={() => {
					if (!taRef) return;
					taRef.focus();
				}}
			/>
			<textarea
				ref={taRef}
				onKeyDown={e => {
					console.log("OnKeyDown", e);
					if (!e.isComposing && e.keyCode !== 229) {
						sendKey(
							keyToEscape(
								e.key,
								e.shiftKey,
								e.ctrlKey,
								e.altKey,
								e.metaKey,
							),
						);
					}
				}}
				onInput={e => {
					console.log("OnInput", e);
					if (!e.isComposing && e.data)
						sendKey(inputDataToEscape(e.data));
				}}
				onCompositionEnd={e => {
					console.log("OnCompositionEnd", e);
					sendKey(inputDataToEscape(e.data));
				}}
			/>
		</>
	);
};

export default Term;
