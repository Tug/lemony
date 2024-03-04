export const scheme = `app.diversified${
	process.env.STAGE === 'development'
		? '.development'
		: process.env.STAGE === 'staging'
		? '.staging'
		: ''
}`;
