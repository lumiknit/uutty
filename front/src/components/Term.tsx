import { Component } from "solid-js";
import { keyToEscape } from "../input/key";
import { inputDataToEscape } from "../input/input";
import { TermState } from "./term-state";
import TermBuffer from "./TermBuffer";

type TermProps = {
	state: TermState;
	class?: string;
	onKeydown?: (e: KeyboardEvent) => void;
	onInput?: (data: string) => void;
};

const Term: Component<TermProps> = props => {
	let taRef: HTMLTextAreaElement | undefined;
	let ref: HTMLDivElement | undefined;

	const focus = () => {
		if (!taRef) return;
		taRef.focus();
	};

	const handleInputData = (data: string) => {
		props.onInput?.(inputDataToEscape(data));
		taRef!.value = "";
	};

	return (
		<>
			<div ref={ref} class="uutty-term" onClick={focus}>
				<TermBuffer buffer={props.state.buffer[0]()} />
			</div>
			<textarea
				ref={taRef}
				onKeyDown={e => {
					console.log("OnKeyDown", e);
					if (props.onKeydown) props.onKeydown(e);
					if (!e.isComposing && e.keyCode !== 229) {
						props.onInput?.(
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
					if (!e.isComposing && e.data) {
						handleInputData(e.data);
					}
				}}
				onCompositionEnd={e => {
					console.log("OnCompositionEnd", e);
					handleInputData(e.data);
				}}
			/>
		</>
	);
};

export default Term;
