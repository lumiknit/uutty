import { ThemeConfig } from "../utils/config";

export enum ColorType {
	c256,
	c24b,
}

export type Color256 = {
	type: ColorType.c256;
	color: number;
};

export type Color24b = {
	type: ColorType.c24b;
	r: number;
	g: number;
	b: number;
};

export type Color = Color256 | Color24b;

export const color24bTo256 = (color: Color24b): Color256 => {
	const { r, g, b } = color;
	const r2 = Math.round((r / 255) * 5);
	const g2 = Math.round((g / 255) * 5);
	const b2 = Math.round((b / 255) * 5);
	const color2 = 16 + r2 * 36 + g2 * 6 + b2;
	return { type: ColorType.c256, color: color2 };
};

const n256ToHex = (n: number): string => {
	const hex = (n % 256).toString(16);
	return hex.length === 1 ? `0${hex}` : hex;
};

export const encodeColor = (color?: Color): string => {
	if (!color) return "_";
	if (color.type === ColorType.c256) {
		return `${n256ToHex(color.color)}`;
	}
	return `#${n256ToHex(color.r)}${n256ToHex(color.g)}${n256ToHex(color.b)}`;
};

export const decodeColor = (color: string): Color | undefined => {
	try {
		if (color.charAt(0) === "#") {
			const rgb = parseInt(color.slice(1), 16);
			return {
				type: ColorType.c24b,
				r: (rgb >> 16) & 0xff,
				g: (rgb >> 8) & 0xff,
				b: rgb & 0xff,
			};
		}
		const n = parseInt(color.slice(1), 16);
		return { type: ColorType.c256, color: n % 256 };
	} catch (e) {}
};

export const rgbStringFromColor = (
	theme: ThemeConfig,
	color: Color,
): string => {
	if (color.type === ColorType.c256) {
		if (color.color <= 16) {
			return theme.ansi[color.color];
		} else if (color.color <= 232) {
			const n = color.color - 16;
			const r = Math.floor(n / 36);
			const g = Math.floor((n % 36) / 6);
			const b = n % 6;
			return `rgb(${r * 51},${g * 51},${b * 51})`;
		} else {
			const n = color.color - 232;
			const v = n * 10 + 8;
			return `rgb(${v},${v},${v})`;
		}
	}
	return `rgb(${color.r},${color.g},${color.b})`;
};
