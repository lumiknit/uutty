import {
	Component,
	For,
	JSX,
	createEffect,
	createSignal,
	onMount,
} from "solid-js";
import { Buffer, BufferLine } from "../xterm/buffer";
import { TermState, currentTheme } from "./term-state";
import { ThemeConfig } from "../utils/config";
import { attributeStringToStyle } from "./helpers";
import wcwidth from "wcwidth";

import "./term-table-buffer.css";

// -- Cursor

type TermCursorProps = {
	state: TermState;
};

const TermCursor: Component<TermCursorProps> = props => {
	let ref: HTMLTableCellElement | undefined;
	onMount(() => {
		const taRef = props.state.taRef;
		if (!taRef) return;
		taRef.style.setProperty("left", `${ref!.offsetLeft}px`);
		taRef.style.setProperty("top", `${ref!.offsetTop}px`);
	});
	return <td ref={ref} class="cursor" />;
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
	len: number;
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
	len: 0,
});

const onlyOneSpace = (t1: string, t2: string) => {
	if (t1 === " ") return t2 !== " ";
	return t2 === " ";
};

const renderLineToChunks = (
	theme: ThemeConfig,
	line: BufferLine,
	cursor?: number,
): RenderedLine => {
	const chunks: LineChunk[] = [];
	let lastChar = "";
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
		if (
			cells[i].attr !== lastAttr ||
			onlyOneSpace(lastChar, cells[i].char)
		) {
			pushChunk();
			chunk = newEmptyChunk("");
			// Parse attr
			lastAttr = cells[i].attr;
			chunk.style = attributeStringToStyle(theme, lastAttr);
		}
		lastChar = cells[i].char;
		chunk.text = chunk.text.trimEnd() + cells[i].char;
		chunk.len += wcwidth(cells[i].char);
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
		chunks: [newEmptyChunk("")],
	});
	createEffect(() => {
		props.state.buffer[0](); // Just subscribe to the buffer
		setRendered(r =>
			r.m === props.line.m && r.cursor === props.cursor
				? r
				: renderLineToChunks(
						currentTheme(props.state),
						props.line,
						props.cursor,
				  ),
		);
	});
	return (
		<tr>
			<For each={rendered().chunks}>
				{chunk =>
					chunk.class === "cursor" ? (
						<TermCursor state={props.state} />
					) : (
						<td
							class={chunk.class}
							style={chunk.style}
							colSpan={chunk.len}>
							{chunk.text}
						</td>
					)
				}
			</For>
		</tr>
	);
};

// -- Buffer

type TermBufferProps = {
	buffer: Buffer;
	state: TermState;
};

const TermTableBuffer: Component<TermBufferProps> = props => {
	return (
		<table class="uutty-term-buffer">
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
		</table>
	);
};

export default TermTableBuffer;
