import { JSX } from "solid-js/h/jsx-runtime";
import { Intensity, stringToAttribute } from "../xterm/buffer";
import { ThemeConfig } from "../utils/config";
import { rgbStringFromColor } from "../xterm/color";

export const attributeStringToStyle = (
	theme: ThemeConfig,
	attrString: string,
): JSX.CSSProperties => {
	const attr = stringToAttribute(attrString);
	const style: JSX.CSSProperties = {};
	if (attr.intensity === Intensity.bold) style["font-weight"] = "bold";
	if (attr.intensity === Intensity.faint) style["opacity"] = "0.5";
	if (attr.italic) style["font-style"] = "italic";
	if (attr.underline >= 2) style["text-decoration-style"] = "double";
	let deco = "";
	if (attr.underline) deco += " underline";
	if (attr.overline) deco += " overline";
	if (attr.crossedOut) deco += " line-through";
	if (deco) style["text-decoration"] = deco;
	if (attr.slowBlink) style["animation"] = "uty-blink 1s step-end infinite";
	if (attr.conceal) style["color"] = "transparent";
	const fg = attr.fg ? rgbStringFromColor(theme, attr.fg) : theme.fg;
	const bg = attr.bg ? rgbStringFromColor(theme, attr.bg) : theme.bg;
	if (attr.reverseVideo) {
		style["color"] = bg;
		style["background-color"] = fg;
	} else {
		style["color"] = fg;
		style["background-color"] = bg;
	}
	return style;
};
