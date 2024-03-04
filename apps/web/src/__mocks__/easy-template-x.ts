export const TemplateHandler = jest.fn().mockImplementation(() => ({
	process: mockTemplateHandlerProcess,
}));

export const mockTemplateHandlerProcess = jest.fn(async () => Buffer.from(''));

beforeEach(() => {
	// Clear all instances and calls to constructor and all methods:
	TemplateHandler.mockClear();
	mockTemplateHandlerProcess.mockClear();
});
