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

import "./term-buffer.css";
import TermCursor from "./TermCursor";

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
			chunk.style = attributeStringToStyle(theme, lastAttr);
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
