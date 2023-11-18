// Display Attribute

import { Color, ColorType, decodeColor, encodeColor } from "./color";
import wcwidth from "wcwidth";

export enum Intensity {
	normal = 0,
	bold = 1,
	faint = 2,
}

export type DisplayAttribute = {
	// Intensity
	intensity: Intensity;
	conceal?: boolean;
	// Italic
	italic?: boolean;
	// Line
	underline: number; // 0: no underline, 1: underline, 2: double underline
	crossedOut?: boolean;
	overline?: boolean;
	// Blink
	slowBlink?: boolean;
	// Colors
	reverseVideo?: boolean;

	fg?: Color;
	bg?: Color;
};

const INTENSITY_SHIFT = 0;
const CONCEAL_SHIFT = 2;
const ITALIC_SHIFT = 3;
const UNDERLINE_SHIFT = 4;
const CROSSED_OUT_SHIFT = 6;
const OVERLINE_SHIFT = 7;
const SLOW_BLINK_SHIFT = 8;
const REVERSE_VIDEO_SHIFT = 9;

export const attributeToString = (attr: DisplayAttribute): string => {
	const n =
		(attr.intensity << INTENSITY_SHIFT) |
		((attr.conceal ? 1 : 0) << CONCEAL_SHIFT) |
		((attr.italic ? 1 : 0) << ITALIC_SHIFT) |
		(attr.underline << UNDERLINE_SHIFT) |
		((attr.crossedOut ? 1 : 0) << CROSSED_OUT_SHIFT) |
		((attr.overline ? 1 : 0) << OVERLINE_SHIFT) |
		((attr.slowBlink ? 1 : 0) << SLOW_BLINK_SHIFT) |
		((attr.reverseVideo ? 1 : 0) << REVERSE_VIDEO_SHIFT);
	return `${n.toString(16)},${encodeColor(attr.fg)},${encodeColor(attr.bg)}`;
};

export const stringToAttribute = (str: string): DisplayAttribute => {
	const [n, fg, bg] = str.split(",");
	const pasrsedN = parseInt(n, 16);
	return {
		intensity: (pasrsedN >> INTENSITY_SHIFT) & 0x3,
		conceal: ((pasrsedN >> CONCEAL_SHIFT) & 0x1) === 1,
		italic: ((pasrsedN >> ITALIC_SHIFT) & 0x1) === 1,
		underline: (pasrsedN >> UNDERLINE_SHIFT) & 0x3,
		crossedOut: ((pasrsedN >> CROSSED_OUT_SHIFT) & 0x1) === 1,
		overline: ((pasrsedN >> OVERLINE_SHIFT) & 0x1) === 1,
		slowBlink: ((pasrsedN >> SLOW_BLINK_SHIFT) & 0x1) === 1,
		reverseVideo: ((pasrsedN >> REVERSE_VIDEO_SHIFT) & 0x1) === 1,
		fg: decodeColor(fg),
		bg: decodeColor(bg),
	};
};

const emptyAttr = {
	intensity: Intensity.normal,
	underline: 0,
};
const emptyAttrString = attributeToString(emptyAttr);

// Get width by wcwidth

export type Cell = {
	char: string; // Empty string if the previous cell is a wide char
	attr: string; // Attr in string
};

export type BufferLine = {
	m: number; // Modified counter
	cells: Cell[];
};

export type Buffer = {
	// Screen State
	lines: BufferLine[];

	// Cursor
	cur: [number, number];

	// State
	size: [number, number]; // Rows, Cols
	attr: DisplayAttribute;
	attrString: string;
	reverseWrapAround?: boolean;

	// Events
	onBell?: () => void;
	onUpdate?: (buffer: Buffer) => void;
};

export const newBuffer = (): Buffer => {
	const attr = { ...emptyAttr };
	const buffer: Buffer = {
		lines: [],
		cur: [0, 0],
		size: [80, 24],
		attr: attr,
		attrString: attributeToString(attr),
	};
	moveCursorLine(buffer, 0);
	moveCursorCol(buffer, 0);
	return buffer;
};

export const resizeBuffer = (buffer: Buffer, cols: number, rows: number) => {
	buffer.size = [rows, cols];
};

const fillEmptyCells = (line: BufferLine, lastIdx: number) => {
	for (let i = line.cells.length; i <= lastIdx; i++) {
		line.cells[i] = {
			char: " ",
			attr: emptyAttrString,
		};
	}
};

const fillEmptyLines = (buffer: Buffer, lastIdx: number) => {
	for (let i = buffer.lines.length; i <= lastIdx; i++) {
		buffer.lines[i] = {
			m: 0,
			cells: [],
		};
	}
};

const moveCursorLine = (buffer: Buffer, line: number) => {
	if (line < 0) line = buffer.lines.length + line;
	fillEmptyLines(buffer, line);
	buffer.cur[0] = line;
	buffer.cur[1] = Math.min(buffer.cur[1], buffer.lines[line].cells.length);
};

const moveCursorLineRelative = (buffer: Buffer, lineDelta: number) =>
	moveCursorLine(buffer, buffer.cur[0] + lineDelta);

const moveCursorCol = (buffer: Buffer, col: number) => {
	if (col < 0) col = buffer.lines[buffer.cur[0]].cells.length + col;
	buffer.cur[1] = col;
	fillEmptyCells(buffer.lines[buffer.cur[0]], col);
};

const moveCursorColRelative = (buffer: Buffer, colDelta: number) =>
	moveCursorCol(buffer, buffer.cur[1] + colDelta);

const putChar = (buffer: Buffer, char: string) => {
	const cw = wcwidth(char);
	const [line, col] = buffer.cur;
	const l = buffer.lines[line];
	l.m++;
	l.cells[col] = {
		char,
		attr: buffer.attrString,
	};
	for (let i = 1; i < cw; i++) {
		l.cells[col + i] = {
			char: "",
			attr: buffer.attrString,
		};
	}
	buffer.cur[1] += cw;
};

export type DataInput = {
	p: number;
	d: string;
};

const handleSGR = (buffer: Buffer, numbers: number[]) => {
	let newAttr = { ...buffer.attr };
	for (let i = 0; i < numbers.length; i++) {
		const n = numbers[i];
		// Color
		if (30 <= n && n <= 37) {
			newAttr.fg = { type: ColorType.c256, color: n - 30 };
			continue;
		}
		if (40 <= n && n <= 47) {
			newAttr.bg = { type: ColorType.c256, color: n - 40 };
			continue;
		}
		if (90 <= n && n <= 97) {
			newAttr.fg = { type: ColorType.c256, color: n - 90 + 8 };
			continue;
		}
		if (100 <= n && n <= 107) {
			newAttr.bg = { type: ColorType.c256, color: n - 100 + 8 };
			continue;
		}
		switch (n) {
			case 0: {
				// Reset
				newAttr = { ...emptyAttr };
				break;
			}
			case 1: {
				// Bold
				newAttr.intensity = Intensity.bold;
				break;
			}
			case 2: {
				// Faint
				newAttr.intensity = Intensity.faint;
				break;
			}
			case 3: {
				// Italic
				newAttr.italic = true;
				break;
			}
			case 4: {
				// Underline
				newAttr.underline = 1;
				break;
			}
			case 5: {
				// Slow blink
				newAttr.slowBlink = true;
				break;
			}
			case 6: {
				// Rapid blink
				// IGNORE
				break;
			}
			case 7: {
				// Reverse video
				newAttr.reverseVideo = true;
				break;
			}
			case 8: {
				// Conceal
				newAttr.conceal = true;
				break;
			}
			case 9: {
				// Crossed-out
				newAttr.crossedOut = true;
				break;
			}
			// case 10-19: Font, IGNORE
			// case 20: Fraktur, IGNORE
			case 21: {
				// Double underline
				newAttr.underline = 2;
				break;
			}
			case 22: {
				// Normal intensity
				newAttr.intensity = Intensity.normal;
				break;
			}
			case 23: {
				// Not italic, not fraktur
				newAttr.italic = false;
				break;
			}
			case 24: {
				// Not underlined
				newAttr.underline = 0;
				break;
			}
			case 25: {
				// Blink off
				newAttr.slowBlink = false;
				break;
			}
			// case 26: Proportional spacing, IGNORE
			case 27: {
				// Not reversed video
				newAttr.reverseVideo = false;
				break;
			}
			case 28: {
				// Reveal
				newAttr.conceal = false;
				break;
			}
			case 29: {
				// Not crossed out
				newAttr.crossedOut = false;
				break;
			}
			// case 30-37: Set foreground color, Handled above
			case 38: {
				// Set foreground color
				if (numbers[i + 1] === 5) {
					newAttr.fg = {
						type: ColorType.c256,
						color: numbers[i + 2],
					};
					i += 2;
				} else if (numbers[i + 1] === 2) {
					newAttr.fg = {
						type: ColorType.c24b,
						r: numbers[i + 2],
						g: numbers[i + 3],
						b: numbers[i + 4],
					};
					i += 4;
				}
				break;
			}
			case 39: {
				// Set foreground color to default
				newAttr.fg = undefined;
				break;
			}
			// case 40-47: Set background color, Handled above
			case 48: {
				// Set background color
				if (numbers[i + 1] === 5) {
					newAttr.bg = {
						type: ColorType.c256,
						color: numbers[i + 2],
					};
					i += 2;
				} else if (numbers[i + 1] === 2) {
					newAttr.bg = {
						type: ColorType.c24b,
						r: numbers[i + 2],
						g: numbers[i + 3],
						b: numbers[i + 4],
					};
					i += 4;
				}
				break;
			}
			case 49: {
				// Set background color to default
				newAttr.bg = undefined;
				break;
			}
			// case 50: Disable proportional spacing, IGNORE
			// case 51: Framed, IGNORE
			// case 52: Encircled, IGNORE
			case 53: {
				// Overlined
				newAttr.overline = true;
				break;
			}
			// case 54: Not framed or encircled, IGNORE
			case 55: {
				// Not overlined
				newAttr.overline = false;
				break;
			}
			// case 58, 59: [re]Set underline color, IGNORE
			// case 60-65: Ideogram, IGNORE
			// case 73-75: sub/superscript, IGNORE
			// case 90-107: Set bright color: handled above
		}
	}
	buffer.attr = newAttr;
	buffer.attrString = attributeToString(newAttr);
};

const handleCSI = (buffer: Buffer, di: DataInput) => {
	// Check ? exists
	let DEC = false;
	if (di.d[di.p] === "?") {
		di.p++;
		DEC = true;
	}
	// Try to parse Pm
	let numbers = [];
	while (true) {
		let s = di.p;
		while ("0" <= di.d[di.p] && di.d[di.p] <= "9") {
			di.p++;
		}
		const n = parseInt(di.d.slice(s, di.p));
		numbers.push(n);
		if (di.d[di.p] !== ";") break;
		di.p++;
	}
	let SP = false;
	if (di.d[di.p] === " ") {
		di.p++;
		SP = true;
	}
	// Execute
	switch (
		di.d[di.p++] // Switch: Execute
	) {
		case "@": {
			// ICH: Insert character
			let [n] = numbers;
			if (!n) n = 1;
			const [line, col] = buffer.cur;
			const l = buffer.lines[line];
			l.m++;
			for (let i = l.cells.length - 1; i >= col; i--) {
				l.cells[i + n] = l.cells[i];
			}
			for (let i = 0; i < n; i++) {
				l.cells[col + i] = {
					char: "",
					attr: emptyAttrString,
				};
			}
			break;
		}
		case "A": {
			// CUU: Cursor up
			let [n] = numbers;
			if (!n) n = 1;
			moveCursorLineRelative(buffer, -n);
			break;
		}
		case "B": {
			// CUD: Cursor down
			let [n] = numbers;
			if (!n) n = 1;
			moveCursorLineRelative(buffer, n);
			break;
		}
		case "a":
		case "C": {
			// CUF: Cursor forward
			let [n] = numbers;
			if (!n) n = 1;
			moveCursorColRelative(buffer, n);
			break;
		}
		case "D": {
			// CUB: Cursor backward
			let [n] = numbers;
			if (!n) n = 1;
			moveCursorColRelative(buffer, -n);
			break;
		}
		case "E": {
			// CNL: Cursor next line
			let [n] = numbers;
			if (!n) n = 1;
			moveCursorLineRelative(buffer, n);
			moveCursorCol(buffer, 0);
			break;
		}
		case "F": {
			// CPL: Cursor previous line
			let [n] = numbers;
			if (!n) n = 1;
			moveCursorLineRelative(buffer, -n);
			moveCursorCol(buffer, 0);
			break;
		}
		case "`":
		case "G": {
			// CHA: Cursor horizontal absolute
			let [n] = numbers;
			if (!n) n = 1;
			moveCursorCol(buffer, n - 1);
			break;
		}
		case "f":
		case "H": {
			// CUP: Cursor position
			let [y, x] = numbers;
			if (!y) y = 1;
			if (!x) x = 1;
			moveCursorLine(buffer, y - 1);
			moveCursorCol(buffer, x - 1);
			break;
		}
		case "I": {
			// CHT: Cursor forward tabulation
			let [n] = numbers;
			if (!n) n = 1;
			moveCursorCol(buffer, Math.ceil((buffer.cur[1] + 1) / 8) * 8);
			break;
		}
		case "J": {
			// ED: Erase in display
			let [n] = numbers;
			if (!n) n = 0;
			switch (n) {
				case 0: {
					// Erase below
					const [line, col] = buffer.cur;
					const l = buffer.lines[line];
					l.m++;
					l.cells.splice(col);
					break;
				}
				case 1: {
					// Erase above
					const [line, col] = buffer.cur;
					const l = buffer.lines[line];
					l.m++;
					l.cells.splice(0, col + 1);
					break;
				}
				case 2: {
					// Erase all
					const [line, col] = buffer.cur;
					const l = buffer.lines[line];
					l.m++;
					l.cells.splice(0);
					break;
				}
				case 3: {
					// Erase saved lines
					// TODO
					break;
				}
			}
			break;
		}
		case "K": {
			// EL: Erase in line
			let [n] = numbers;
			if (!n) n = 0;
			switch (n) {
				case 0: {
					// Erase right
					const [line, col] = buffer.cur;
					const l = buffer.lines[line];
					l.m++;
					l.cells.splice(col);
					break;
				}
				case 1: {
					// Erase left
					const [line, col] = buffer.cur;
					const l = buffer.lines[line];
					l.m++;
					l.cells.splice(0, col + 1);
					break;
				}
				case 2: {
					// Erase all
					const [line, col] = buffer.cur;
					const l = buffer.lines[line];
					l.m++;
					l.cells.splice(0);
					break;
				}
			}
			break;
		}
		case "L": {
			// IL: Insert line
			let [n] = numbers;
			if (!n) n = 1;
			const [line, col] = buffer.cur;
			const l = buffer.lines[line];
			l.m++;
			for (let i = buffer.lines.length - 1; i >= line; i--) {
				buffer.lines[i + n] = buffer.lines[i];
			}
			for (let i = 0; i < n; i++) {
				buffer.lines[line + i] = {
					m: 0,
					cells: [],
				};
			}
			break;
		}
		case "M": {
			// DL: Delete line
			let [n] = numbers;
			if (!n) n = 1;
			const [line, col] = buffer.cur;
			const l = buffer.lines[line];
			l.m++;
			for (let i = line; i < buffer.lines.length - n; i++) {
				buffer.lines[i] = buffer.lines[i + n];
			}
			for (let i = 0; i < n; i++) {
				buffer.lines.pop();
			}
			break;
		}
		case "P": {
			// DCH: Delete character
			let [n] = numbers;
			if (!n) n = 1;
			const [line, col] = buffer.cur;
			const l = buffer.lines[line];
			l.m++;
			l.cells.splice(col, n);
			break;
		}
		case "S": {
			// SU: Scroll up
			let [n] = numbers;
			if (!n) n = 1;
			for (let i = 0; i < n; i++) {
				buffer.lines.shift();
				buffer.lines.push({
					m: 0,
					cells: [],
				});
			}
			break;
		}
		case "T": {
			// SD: Scroll down
			let [n] = numbers;
			if (!n) n = 1;
			for (let i = 0; i < n; i++) {
				buffer.lines.pop();
				buffer.lines.unshift({
					m: 0,
					cells: [],
				});
			}
			break;
		}
		case "X": {
			// ECH: Erase character
			let [n] = numbers;
			if (!n) n = 1;
			const [line, col] = buffer.cur;
			const l = buffer.lines[line];
			l.m++;
			for (let i = col; i < col + n; i++) {
				l.cells[i] = {
					char: "",
					attr: emptyAttrString,
				};
			}
			break;
		}
		case "Z": {
			// CBT: Cursor backward tabulation
			let [n] = numbers;
			if (!n) n = 1;
			moveCursorCol(buffer, Math.ceil((buffer.cur[1] + 1) / 8) * 8);
			break;
		}
		case "b": {
			// REP: Repeat
			let [n] = numbers;
			if (!n) n = 1;
			const [line, col] = buffer.cur;
			const l = buffer.lines[line];
			l.m++;
			for (let i = 0; i < n; i++) {
				l.cells[col + i] = {
					char: l.cells[col].char,
					attr: l.cells[col].attr,
				};
			}
			break;
		}
		case "c": {
			// DA: Device attributes
			// TODO
			break;
		}
		case "d": {
			// VPA: Vertical position absolute
			let [n] = numbers;
			if (!n) n = 1;
			moveCursorLine(buffer, n - 1);
			break;
		}
		case "e": {
			// VPR: Vertical position relative
			let [n] = numbers;
			if (!n) n = 1;
			moveCursorLineRelative(buffer, n);
			break;
		}
		case "g": {
			// TBC: Tabulation clear
			let [n] = numbers;
			if (!n) n = 0;
			switch (n) {
				case 0: {
					// Clear tab stop
					// TODO
					break;
				}
				case 3: {
					// Clear all tab stops
					// TODO
					break;
				}
			}
			break;
		}
		case "h": {
			// SM: Set mode
			// TODO
			break;
		}
		case "l": {
			// RM: Reset mode
			// TODO
			break;
		}
		case "m": {
			// SGR: Select graphic rendition
			return handleSGR(buffer, numbers);
		}
	} // Switch: Execute
};

const handleOSC = (buffer: Buffer, di: DataInput) => {};

const handleESC = (buffer: Buffer, di: DataInput) => {
	const c = di.d[di.p++];
	switch (c) {
		case "7": {
			// SC: Save cursor position
			// TODO
			break;
		}
		case "8": {
			// RC: Restore cursor position
			// TODO
			break;
		}
		case "#": {
			const c = di.d[di.p++];
			switch (c) {
				case "8": {
					// DECALN: Screen alignment pattern
					// TODO
					break;
				}
				default: {
					// Unknown sequence
					break;
				}
			}
			break;
		}
		case "D": {
			// IND: Index
			moveCursorLineRelative(buffer, 1);
			break;
		}
		case "E": {
			// NEL: Next line
			moveCursorLineRelative(buffer, 1);
			moveCursorCol(buffer, 0);
			break;
		}
		case "H": {
			// HTS: Horizontal tab set
			// TODO
			break;
		}
		case "M": {
			// RI: Reverse index
			moveCursorLineRelative(buffer, -1);
			break;
		}
		case "Z": {
			// DECID: Identify terminal
			// TODO
			break;
		}
		case "[": {
			// CSI: Control sequence introducer
			return handleCSI(buffer, di);
		}
		case "]": {
			// OSC: Operating system command
			return handleOSC(buffer, di);
		}
		case "^": {
			// PM: Privacy message
			// TODO
			break;
		}
		case "_": {
			// APC: Application program command
			// IGNORE
			break;
		}
	}
};

export const putDataInput = (buffer: Buffer, data: string) => {
	// TODO: Handle xterm sequence
	let di: DataInput = {
		p: 0,
		d: data,
	};
	while (di.p < di.d.length) {
		const c = di.d[di.p++];
		switch (c) {
			case "\x00": {
				// NUL: Ignore
				break;
			}
			case "\x07": {
				// BEL: Ring the bell
				buffer.onBell?.();
				break;
			}
			case "\x08": {
				// BS: Move cursor left
				if (buffer.cur[1] > 0) {
					moveCursorColRelative(buffer, -1);
				} else if (buffer.reverseWrapAround) {
					moveCursorLineRelative(buffer, -1);
					moveCursorCol(buffer, -1);
				} else {
					// Do nothing
				}
				break;
			}
			case "\x09": {
				// HT: Move cursor to the next tab stop
				moveCursorCol(buffer, Math.ceil((buffer.cur[1] + 1) / 8) * 8);
				break;
			}
			case "\x0a":
			case "\x0b":
			case "\x0c": {
				// LF, VT, FF: Move cursor to the next line
				moveCursorLineRelative(buffer, 1);
				break;
			}
			case "\x0d": {
				// CR: Move cursor to the first column
				moveCursorCol(buffer, 0);
				break;
			}
			case "\x0e": {
				// SO: Switch to G1 character set
				// TODO
				break;
			}
			case "\x0f": {
				// SI: Switch to G0 character set
				// TODO
				break;
			}
			case "\x1b": {
				// ESC: Escape sequence
				handleESC(buffer, di);
				break;
			}
			default:
				putChar(buffer, c);
		}
	}
	buffer.onUpdate?.(buffer);
};
