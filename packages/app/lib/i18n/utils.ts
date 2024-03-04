export function cleanUpSpecialChars(str: string) {
	return str
		.replace(/[ÀÁÂÃÄÅ]/g, 'A')
		.replace(/[àáâãäå]/g, 'a')
		.replace(/[ÈÉÊË]/g, 'E')
		.replace(/[èéêë]/g, 'e')
		.replace(/[ÌÍÎÏ]/g, 'I')
		.replace(/[ìíîï]/g, 'i');
}
