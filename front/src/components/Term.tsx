import { Component, createEffect, onMount } from "solid-js";
import { TermState } from "./term-state";
import TermBuffer from "./TermBuffer";
import { inputToSeq, specialKeyToSeq } from "../xterm/input";

import "./Term.css";

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

	const themeConfig = () => props.state.config.themes[props.state.theme[0]()];

	const focus = () => {
		if (!taRef) return;
		taRef.focus();
	};

	const handleInputData = (data: string) => {
		props.onInput?.(inputToSeq(data));
		taRef!.value = "";
	};

	const resizeTerm = (width: number, height: number) => {
		if (!props.onResize) return;
		// Get 'M' character's width and height
		const canvas = canvasRef!;
		const ctx = canvas.getContext("2d")!;
		ctx.font = `${themeConfig().fontSize}px ${themeConfig().fontFamily}`;
		const metrics = ctx.measureText("M");
		const charWidth = metrics.width;
		const charHeight = metrics.actualBoundingBoxAscent;
		// Calculate new terminal size
		const cols = Math.floor(width / charWidth);
		const rows = Math.floor(height / charHeight);
		// Resize
		props.onResize(cols, rows);
	};

	onMount(() => {
		props.state.taRef = taRef;
		const resizeObserver = new ResizeObserver(entries => {
			if (!entries.length) return;
			const entry = entries[0];
			resizeTerm(entry.contentRect.width, entry.contentRect.height);
		});
		resizeObserver.observe(containerRef!);
	});

	const handleKeyDownTA = (e: KeyboardEvent) => {
		// console.log("OnKeyDown", e);
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
	};
	const handleInputTA = (e: InputEvent) => {
		// console.log("OnInput", e);
		if (!e.isComposing && e.data) {
			handleInputData(e.data);
		}
	};
	const handleCompositionEndTA = (e: CompositionEvent) => {
		// console.log("OnCompositionEnd", e);
		handleInputData(e.data);
	};

	return (
		<div
			class="uutty-term"
			style={{
				"background-color": themeConfig().bg,
				padding: "10px",
			}}>
			<div
				ref={containerRef}
				class="uutty-term-container"
				onClick={focus}
				style={{
					"font-family": themeConfig().fontFamily,
					"font-size": `${themeConfig().fontSize}px`,
					color: themeConfig().fg,
				}}>
				<TermBuffer
					state={props.state}
					buffer={props.state.buffer[0]()}
				/>
				<textarea
					ref={taRef}
					class={`uutty-cursor`}
					onKeyDown={handleKeyDownTA}
					onInput={handleInputTA}
					onCompositionEnd={handleCompositionEndTA}
					style={{
						"font-family": themeConfig().fontFamily,
						"font-size": `${themeConfig().fontSize}px`,
						color: themeConfig().fg,
						"border-color": themeConfig().cursor,
					}}
				/>
				<canvas ref={canvasRef} class="uutty-dummy-canvas" />
			</div>
		</div>
	);
};

export default Term;
