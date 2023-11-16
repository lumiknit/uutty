export const genRandomString = (length: number) => {
	let s = "";
	while (s.length < length) {
		s += Math.random().toString(36).slice(2);
	}
	return s.slice(0, length);
};
