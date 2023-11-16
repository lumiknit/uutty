export type BufferLine = {
	text: string;
};

const newBufferLine = (): BufferLine => ({
	text: "",
});

export type Buffer = {
	lines: BufferLine[];
	cursor: [number, number];
};

export const newBuffer = (): Buffer => ({
	lines: [newBufferLine()],
	cursor: [0, 0],
});

const addNewLine = (buffer: Buffer) => {
	buffer.cursor[0]++;
	while (buffer.lines.length <= buffer.cursor[0]) {
		buffer.lines.push({
			text: "",
		});
	}
};

export const putDataOnBuffer = (buffer: Buffer, data: string) => {
	let p = 0;
	while (p < data.length) {
		switch (data.charCodeAt(p)) {
			case 0x07: {
				// ^G, BEL
				p++;
				alert("BELL");
				break;
			}
			case 0x08: {
				// ^H, BS
				buffer.cursor[1] = Math.max(0, buffer.cursor[1] - 1);
				p++;
				break;
			}
			case 0x09: {
				// ^I, TAB
				buffer.cursor[1] += 8;
				p++;
				break;
			}
			case 0x0a: {
				// ^J, LF
				addNewLine(buffer);
				p++;
				break;
			}
			case 0x0d: {
				// ^M, CR
				buffer.cursor[1] = 0;
				p++;
				break;
			}
			case 0x1b: {
				// ^[, ESC
				// TODO: escape sequences
				p++;
				break;
			}
			case 0x7f: {
				// ^?, DEL
				buffer.cursor[1] = Math.max(0, buffer.cursor[1] - 1);
				const l = buffer.cursor[0];
				buffer.lines[l] = {
					...buffer.lines[l],
					text:
						buffer.lines[l].text.slice(0, buffer.cursor[1]) +
						buffer.lines[l].text.slice(buffer.cursor[1] + 1),
				};
				p++;
				break;
			}
			default: {
				const l = buffer.cursor[0];
				buffer.lines[l] = {
					...buffer.lines[l],
					text:
						buffer.lines[l].text.slice(0, buffer.cursor[1]) +
						data[p] +
						buffer.lines[l].text.slice(buffer.cursor[1] + 1),
				};
				buffer.cursor[1]++;
				p++;
				break;
			}
		}
	}
	return { ...buffer };
};
