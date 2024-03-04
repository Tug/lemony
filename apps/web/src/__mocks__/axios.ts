const axiosMock = jest.fn();
axiosMock.get = jest.fn();
axiosMock.post = jest.fn();
axiosMock.create = jest.fn(() => axiosMock);
axiosMock.interceptors = {
	request: { use: jest.fn(), eject: jest.fn() },
	response: { use: jest.fn(), eject: jest.fn() },
};
export default axiosMock;
