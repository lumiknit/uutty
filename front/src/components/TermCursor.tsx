import { Component, onMount } from "solid-js";
import { TermState } from "./term-state";

type TermCursorProps = {
	state: TermState;
};

const TermCursor: Component<TermCursorProps> = props => {
	let ref: HTMLTableCellElement | undefined;
	onMount(() => {
		const taRef = props.state.taRef;
		const divRef = props.state.bufferWrapperRef;
		if (!taRef || !divRef || !ref) return;
		const selfRect = ref.getBoundingClientRect();
		const divRect = divRef.getBoundingClientRect();
		taRef.style.setProperty("left", `${selfRect.left - divRect.left}px`);
		taRef.style.setProperty("top", `${selfRect.top - divRect.top}px`);
	});
	return <span ref={ref} class="cursor" />;
};

export default TermCursor;
