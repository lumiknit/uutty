// input: Convert key/mouse events into terminal input escape sequences (for xterm)

// https://en.wikipedia.org/wiki/ANSI_escape_code
// `STTY='raw -echo min 0 time 40' cat -vte` to see escape sequences on terminal

const ESC = "\x1b";

// Key to map

// Mapping from keycode to ascii
// Ctrl & shift will be added as prefix "^" and "+"
const controlMap = new Map<string, string>([
	["^+Digit2", "\x00"],
	["^BracketLeft", "\x1b"],
	["^Backslash", "\x1c"],
	["^BracketRight", "\x1d"],
	["^Caret", "\x1e"],
	["^Underscore", "\x1f"],
]);

for (let i = 0; i < 26; i++) {
	controlMap.set(
		`^${String.fromCharCode(65 + i)}`,
		String.fromCharCode(1 + i),
	);
	controlMap.set(
		`^${String.fromCharCode(97 + i)}`,
		String.fromCharCode(1 + i),
	);
}

export const specialKeyToSeq = (
	key: string,
	code: string,
	ctrl: boolean,
	shift: boolean,
	alt: boolean,
): string => {
	// Overwrite digit / key to prevent option key in mac
	if (code.startsWith("Digit")) {
		key = code.slice(5);
	}
	if (code.startsWith("Key")) {
		const t = (key = code.slice(3));
		if (t.toLowerCase() !== key.toLowerCase()) {
			key = shift ? t : t.toLowerCase();
		}
	}
	const charCode = key.charCodeAt(0);
	let seq = "";
	const mmkey = `${ctrl ? "^" : ""}${shift ? "+" : ""}${key}`;
	// console.log("mm", mmkey, asciiCodeMap.get(mmkey));
	if (controlMap.has(mmkey)) {
		seq = controlMap.get(mmkey)!;
	} else if (key.length === 1 && 32 <= charCode && charCode < 127) {
		console.log(key, code);
		if (alt) {
			seq = key;
		}
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
