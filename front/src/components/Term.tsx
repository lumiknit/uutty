import { Component, Match, Switch, createEffect, onMount } from "solid-js";
import { TermState, currentTheme } from "./term-state";
import TermBuffer from "./TermBuffer";
import { inputToSeq, specialKeyToSeq } from "../xterm/input";

import "./Term.css";
import TermTableBuffer from "./TermTableBuffer";

type TermProps = {
	state: TermState;
	class?: string;
	onKeydown?: (e: KeyboardEvent) => void;
	onInput?: (data: string) => void;
	onResize?: (cols: number, rows: number) => void;
};

const Term: Component<TermProps> = props => {
	let containerRef: HTMLDivElement | undefined;
	let taRef: HTMLTextAreaElement | undefined;
	let canvasRef: HTMLCanvasElement | undefined;

	const focus = () => {
		if (!taRef) return;
		taRef.focus();
	};

	const handleInputData = (data: string) => {
		props.onInput?.(inputToSeq(data));
		taRef!.value = "";
	};

	onMount(() => {
		props.state.taRef = taRef;
	});

	const handleKeyDownTA = (e: KeyboardEvent) => {
		console.log("OnKeyDown", e);
		if (props.onKeydown) props.onKeydown(e);
		if (!e.isComposing && e.keyCode !== 229) {
			//alert(`Key[${e.key}], Code[${e.code}], KeyCode[${e.keyCode}]`);
			const seq = specialKeyToSeq(
				e.key,
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
	};
	const handleInputTA = (e: InputEvent) => {
		console.log("OnInput", e);
		if (!e.isComposing && e.data) {
			handleInputData(e.data);
		}
	};
	const handleCompositionEndTA = (e: CompositionEvent) => {
		console.log("OnCompositionEnd", e);
		handleInputData(e.data);
	};

	return (
		<div
			class="uutty-term"
			style={{
				"background-color": currentTheme(props.state).bg,
				padding: "10px",
			}}
			onClick={focus}>
			<div
				ref={containerRef}
				class="uutty-term-container"
				style={{
					"font-family": currentTheme(props.state).fontFamily,
					"font-size": `${currentTheme(props.state).fontSize}px`,
					color: currentTheme(props.state).fg,
				}}>
				<Switch>
					<Match when={currentTheme(props.state).tableBuffer}>
						<TermTableBuffer
							state={props.state}
							buffer={props.state.buffer[0]()}
						/>
					</Match>
					<Match when={true}>
						<TermBuffer
							state={props.state}
							buffer={props.state.buffer[0]()}
						/>
					</Match>
				</Switch>

				<textarea
					ref={taRef}
					class={`uutty-cursor`}
					onKeyDown={handleKeyDownTA}
					onInput={handleInputTA}
					onCompositionEnd={handleCompositionEndTA}
					style={{
						"font-family": currentTheme(props.state).fontFamily,
						"font-size": `${currentTheme(props.state).fontSize}px`,
						color: currentTheme(props.state).fg,
						"border-color": currentTheme(props.state).cursor,
					}}
				/>
			</div>
		</div>
	);
};

export default Term;
