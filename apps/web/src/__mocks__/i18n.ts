const i18nextMock = {
	t: (key: string) => key,
	language: 'en',
	changeLanguage: (newLang) => {
		i18nextMock.language = newLang;
	},
};

const config = {};

export { config };

export const init = async () => {
	return i18nextMock;
};

export default i18nextMock;
