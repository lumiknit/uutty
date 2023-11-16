import { Signal, createSignal } from "solid-js";
import { ClientConfig } from "../utils/config";
import { Buffer, newBuffer, putDataOnBuffer } from "../xterm/buffer";

export type TermState = {
	config: ClientConfig;
	theme: number;

	buffer: Signal<Buffer>;
};

export const newTermState = (config: ClientConfig): TermState => ({
	config,
	theme: 0,

	buffer: createSignal(newBuffer()),
});

export const putData = (state: TermState, data: string) => {
	state.buffer[1](buf => putDataOnBuffer(buf, data));
};
