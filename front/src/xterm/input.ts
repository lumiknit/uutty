// input: Convert key/mouse events into terminal input escape sequences (for xterm)

// https://en.wikipedia.org/wiki/ANSI_escape_code
// `STTY='raw -echo min 0 time 40' cat -vte` to see escape sequences on terminal

const ESC = "\x1b";

// Key to map

// Mapping from keycode to ascii
// Ctrl & shift will be added as prefix "^" and "+"
const asciiCodeMap = new Map<string, string>([
	["^+Digit2", "\x00"],
	["^BracketLeft", "\x1b"],
	["^Backslash", "\x1c"],
	["^BracketRight", "\x1d"],
	["^Caret", "\x1e"],
	["^Underscore", "\x1f"],
	["+Digit1", "!"],
	["+Digit2", "@"],
	["+Digit3", "#"],
	["+Digit4", "$"],
	["+Digit5", "%"],
	["+Digit6", "^"],
	["+Digit7", "&"],
	["+Digit8", "*"],
	["+Digit9", "("],
	["+Digit0", ")"],
	["+Minus", "_"],
	["+Equal", "+"],
	["+Backspace", "\x7f"],
	["+BracketLeft", "{"],
	["+BracketRight", "}"],
	["+Backslash", "|"],
	["+Semicolon", ":"],
	["+Quote", '"'],
	["+Comma", "<"],
	["+Period", ">"],
	["+Slash", "?"],
	["+Enter", "\r"],
	["+Space", " "],
	["+Backquote", "~"],
	["+Minus", "_"],
	["+Equal", "+"],
	["+BracketLeft", "{"],
	["+BracketRight", "}"],
	["+Backslash", "|"],
	["+Semicolon", ":"],
	["Space", " "],
	["Minus", "-"],
	["Equal", "="],
	["Backspace", "\x7f"],
	["BracketLeft", "["],
	["BracketRight", "]"],
	["Backslash", "\\"],
	["Semicolon", ";"],
	["Quote", "'"],
	["Comma", ","],
	["Period", "."],
	["Slash", "/"],
	["Backquote", "`"],
]);

for (let i = 0; i < 10; i++) {
	asciiCodeMap.set(`Digit${i}`, i.toString());
}
for (let i = 0; i < 26; i++) {
	asciiCodeMap.set(
		`Key${String.fromCharCode(65 + i)}`,
		String.fromCharCode(97 + i),
	);
	asciiCodeMap.set(
		`+Key${String.fromCharCode(65 + i)}`,
		String.fromCharCode(65 + i),
	);
	asciiCodeMap.set(
		`^Key${String.fromCharCode(65 + i)}`,
		String.fromCharCode(1 + i),
	);
}

// Mapping keycode and ascii
const asciiMap = new Map<string, string>();

export const specialKeyToSeq = (
	key: string,
	ctrl: boolean,
	shift: boolean,
	alt: boolean,
): string => {
	let seq = "";
	const mmkey = `${ctrl ? "^" : ""}${shift ? "+" : ""}${key}`;
	console.log("mm", mmkey, asciiCodeMap.get(mmkey));
	if (asciiCodeMap.has(mmkey)) {
		seq = asciiCodeMap.get(mmkey)!;
	} else {
		switch (key) {
			case "Enter":
				seq = "\r";
				break;
			case "Tab":
				seq = shift ? `${ESC}[Z` : "\t";
				break;
			case "Backspace":
				seq = "\x7f";
				break;
			case "Delete":
				seq = `${ESC}[3~`;
				break;
			case "ArrowUp":
				seq = `${ESC}[A`;
				break;
			case "ArrowDown":
				seq = `${ESC}[B`;
				break;
			case "ArrowRight":
				seq = `${ESC}[C`;
				break;
			case "ArrowLeft":
				seq = `${ESC}[D`;
				break;
			case "PageUp":
				seq = `${ESC}[5~`;
				break;
			case "PageDown":
				seq = `${ESC}[6~`;
				break;
			case "Home":
				seq = `${ESC}[H`;
				break;
			case "End":
				seq = `${ESC}[F`;
				break;
			case "Insert":
				seq = `${ESC}[2~`;
				break;
			case "Escape":
				seq = `${ESC}`;
				break;
			case "F1":
				seq = `${ESC}[1P`;
				break;
			case "F2":
				seq = `${ESC}[1Q`;
				break;
			case "F3":
				seq = `${ESC}[1R`;
				break;
			case "F4":
				seq = `${ESC}[1S`;
				break;
			case "F5":
				seq = `${ESC}[15~`;
				break;
			case "F6":
				seq = `${ESC}[17~`;
				break;
			case "F7":
				seq = `${ESC}[18~`;
				break;
			case "F8":
				seq = `${ESC}[19~`;
				break;
			case "F9":
				seq = `${ESC}[20~`;
				break;
			case "F10":
				seq = `${ESC}[21~`;
				break;
			case "F11":
				seq = `${ESC}[23~`;
				break;
			case "F12":
				seq = `${ESC}[24~`;
				break;
		}
	}
	if (seq && alt) seq = ESC + seq;
	return seq;
};

export const specialKeys = new Set([
	"ArrowUp",
	"ArrowDown",
	"ArrowRight",
	"ArrowLeft",
	"Enter",
	"Backspace",
	"Tab",
	"Delete",
	"Home",
	"End",
	"PageUp",
	"PageDown",
	"Insert",
	"Escape",
	"F1",
	"F2",
	"F3",
	"F4",
	"F5",
	"F6",
	"F7",
	"F8",
	"F9",
	"F10",
	"F11",
	"F12",
]);

export const inputToSeq = (data: string): string => {
	if (specialKeys.has(data)) return "";
	return data;
};
