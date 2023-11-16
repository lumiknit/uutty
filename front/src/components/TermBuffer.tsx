import { Component, For } from "solid-js";
import { Buffer, BufferLine } from "../xterm/buffer";

type TermBufferLineProps = {
	line: BufferLine;
	cursor?: number;
};

const TermBufferLine: Component<TermBufferLineProps> = props => {
	return <div>{props.line.text}</div>;
};

type TermBufferProps = {
	buffer: Buffer;
};

const TermBuffer: Component<TermBufferProps> = props => {
	return (
		<For each={props.buffer.lines}>
			{(line, idx) => (
				<TermBufferLine
					line={line}
					cursor={
						props.buffer.cursor[0] === idx()
							? props.buffer.cursor[1]
							: undefined
					}
				/>
			)}
		</For>
	);
};

export default TermBuffer;
