// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// 60s as github actions can be slow
jest.setTimeout(60000);

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
// import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import { TextEncoder, TextDecoder } from 'util';

Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // Deprecated
		removeListener: jest.fn(), // Deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});
require('react-native-reanimated').setUpTests();

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
jest.mock('src/lib/emails/sendgrid');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
