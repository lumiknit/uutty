export const inputDataToEscape = (data: string): string => {
	// Convert given key into ANSI Escape
	switch (data) {
		case "ArrowUp":
			return "\x1b[A";
		case "ArrowDown":
			return "\x1b[B";
		case "ArrowRight":
			return "\x1b[C";
		case "ArrowLeft":
			return "\x1b[D";
		case "Enter":
			return "\r";
		case "Backspace":
			return "\x7f";
		case "Tab":
			return "\t";
		case "Delete":
			return "\x1b[3~";
		case "Home":
			return "\x1bOH";
		case "End":
			return "\x1bOF";
		case "PageUp":
			return "\x1b[5~";
		case "PageDown":
			return "\x1b[6~";
		case "Insert":
			return "\x1b[2~";
		case "Escape":
			return "\x1b";
		case "F1":
			return "\x1bOP";
		case "F2":
			return "\x1bOQ";
		case "F3":
			return "\x1bOR";
		case "F4":
			return "\x1bOS";
		case "F5":
			return "\x1b[15~";
		case "F6":
			return "\x1b[17~";
		case "F7":
			return "\x1b[18~";
		case "F8":
			return "\x1b[19~";
		case "F9":
			return "\x1b[20~";
		case "F10":
			return "\x1b[21~";
		case "F11":
			return "\x1b[23~";
		case "F12":
			return "\x1b[24~";
	}
	return data;
};
