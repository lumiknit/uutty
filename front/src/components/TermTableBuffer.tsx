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
import TermCursor from "./TermCursor";

// -- BufferLine

type TermBufferLineProps = {
	state: TermState;
	line: BufferLine;
	cursor?: number;
};

type LineChunk = {
	style: JSX.CSSProperties;
	text: string;
	len: number;
	cursor?: boolean;
};

export type RenderedLine = {
	m: number; // Modificaion counter
	cursor?: number; // Cursor position
	chunks: LineChunk[];
};

const newEmptyChunk = (): LineChunk => ({
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
	let chunk: LineChunk = newEmptyChunk();
	// Helpers
	const pushChunk = () => {
		if (chunk.text) chunks.push(chunk);
	};
	const pushCursor = () => {
		chunk.cursor = true;
		pushChunk();
		chunk = newEmptyChunk();
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
			chunk = newEmptyChunk();
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
		chunks: [newEmptyChunk()],
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
				{chunk => (
					<td style={chunk.style} colSpan={chunk.len}>
						{chunk.text}
						<TermCursor state={props.state} />
					</td>
				)}
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
