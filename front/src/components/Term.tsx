import { Component } from "solid-js";
import { TermState } from "./term-state";
import TermBuffer from "./TermBuffer";
import { inputToSeq, specialKeyToSeq } from "../xterm/input";

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
		props.onInput?.(inputToSeq(data));
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
						const seq = specialKeyToSeq(
							e.code,
							e.ctrlKey,
							e.shiftKey,
							e.altKey || e.metaKey,
						);
						if (seq) {
							e.preventDefault();
							e.stopPropagation();
							props.onInput?.(seq);
						}
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
