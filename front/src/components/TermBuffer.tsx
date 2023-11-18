import {
	Component,
	For,
	JSX,
	createEffect,
	createSignal,
	onMount,
} from "solid-js";
import {
	Buffer,
	BufferLine,
	Intensity,
	stringToAttribute,
} from "../xterm/buffer";
import { TermState } from "./term-state";
import { rgbStringFromColor } from "../xterm/color";
import { ThemeConfig } from "../utils/config";

// -- Cursor

type TermCursorProps = {
	state: TermState;
};

const TermCursor: Component<TermCursorProps> = props => {
	let ref: HTMLSpanElement | undefined;
	onMount(() => {
		const taRef = props.state.taRef;
		if (!taRef) return;
		taRef.style.setProperty("left", `${ref!.offsetLeft}px`);
		taRef.style.setProperty("top", `${ref!.offsetTop}px`);
	});
	return <span ref={ref} class="cursor" />;
};

// -- BufferLine

type TermBufferLineProps = {
	state: TermState;
	line: BufferLine;
	cursor?: number;
};

type LineChunk = {
	class: string;
	style: JSX.CSSProperties;
	text: string;
};

export type RenderedLine = {
	m: number; // Modificaion counter
	cursor?: number; // Cursor position
	chunks: LineChunk[];
};

const newEmptyChunk = (cls: string): LineChunk => ({
	class: cls,
	style: {},
	text: "",
});

const renderLineToChunks = (
	theme: ThemeConfig,
	line: BufferLine,
	cursor?: number,
): RenderedLine => {
	const chunks: LineChunk[] = [];
	let lastAttr = "_";
	let chunk: LineChunk = newEmptyChunk("");
	// Helpers
	const pushChunk = () => {
		if (chunk.text) chunks.push(chunk);
	};
	const pushCursor = () => {
		pushChunk();
		chunks.push(newEmptyChunk("cursor"));
		chunk = newEmptyChunk("");
	};
	const cells = line.cells;
	let i = 0;
	for (; i < cells.length; i++) {
		if (i === cursor) pushCursor();
		if (cells[i].attr !== lastAttr) {
			pushChunk();
			chunk = newEmptyChunk("");
			// Parse attr
			lastAttr = cells[i].attr;
			const attr = stringToAttribute(lastAttr);
			if (attr.intensity === Intensity.bold)
				chunk.style["font-weight"] = "bold";
			if (attr.intensity === Intensity.faint)
				chunk.style["opacity"] = "0.5";
			if (attr.italic) chunk.style["font-style"] = "italic";
			if (attr.underline >= 2)
				chunk.style["text-decoration-style"] = "double";
			let deco = "";
			if (attr.underline) deco += " underline";
			if (attr.overline) deco += " overline";
			if (attr.crossedOut) deco += " line-through";
			if (deco) chunk.style["text-decoration"] = deco;
			if (attr.slowBlink)
				chunk.style["animation"] = "uty-blink 1s step-end infinite";
			if (attr.conceal) chunk.style["color"] = "transparent";
			const fg = attr.fg ? rgbStringFromColor(theme, attr.fg) : theme.fg;
			const bg = attr.bg ? rgbStringFromColor(theme, attr.bg) : theme.bg;
			if (attr.reverseVideo) {
				chunk.style["color"] = bg;
				chunk.style["background-color"] = fg;
			} else {
				chunk.style["color"] = fg;
				chunk.style["background-color"] = bg;
			}
			lastAttr = cells[i].attr;
		}
		chunk.text += cells[i].char;
	}
	if (i === cursor) pushCursor();
	pushChunk();
	return {
		m: line.m,
		cursor,
		chunks,
	};
};

const TermBufferLine: Component<TermBufferLineProps> = props => {
	const [rendered, setRendered] = createSignal<RenderedLine>({
		m: 0,
		chunks: [
			{
				class: "",
				style: {},
				text: " ",
			},
		],
	});
	const theme = () => props.state.config.themes[props.state.theme[0]()];
	createEffect(() => {
		props.state.buffer[0](); // Just subscribe to the buffer
		setRendered(r =>
			r.m === props.line.m && r.cursor === props.cursor
				? r
				: renderLineToChunks(theme(), props.line, props.cursor),
		);
	});
	return (
		<div>
			<For each={rendered().chunks}>
				{chunk =>
					chunk.class === "cursor" ? (
						<TermCursor state={props.state} />
					) : (
						<span class={chunk.class} style={chunk.style}>
							{chunk.text}
						</span>
					)
				}
			</For>
		</div>
	);
};

// -- Buffer

type TermBufferProps = {
	buffer: Buffer;
	state: TermState;
};

const TermBuffer: Component<TermBufferProps> = props => {
	return (
		<div class="uutty-term-buffer">
			<For each={props.buffer.lines}>
				{(line, idx) => (
					<TermBufferLine
						state={props.state}
						line={line}
						cursor={
							props.buffer.cur[0] === idx()
								? props.buffer.cur[1]
								: undefined
						}
					/>
				)}
			</For>
		</div>
	);
};

export default TermBuffer;
