import { Signal, createSignal } from "solid-js";
import { ClientConfig } from "../utils/config";
import { Buffer, newBuffer, putDataInput, resizeBuffer } from "../xterm/buffer";

export type TermState = {
	config: ClientConfig;
	theme: Signal<number>;
	taRef?: HTMLTextAreaElement;
	buffer: Signal<Buffer>;
};

export const newTermState = (config: ClientConfig): TermState => ({
	config,
	theme: createSignal(0),
	buffer: createSignal(newBuffer(), { equals: false }),
});

export const resize = (state: TermState, cols: number, rows: number) => {
	state.buffer[1](s => {
		resizeBuffer(s, cols, rows);
		return s;
	});
};

export const putData = (state: TermState, data: string) => {
	state.buffer[1](s => {
		putDataInput(s, data);
		return s;
	});
};

export const currentTheme = (state: TermState) =>
	state.config.themes[state.theme[0]()];
