require('@testing-library/jest-dom')

// Mock localStorage for testing
const localStorageMock = (function () {
    let store = {}
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString()
        }),
        removeItem: jest.fn(key => {
            delete store[key]
        }),
        clear: jest.fn(() => {
            store = {}
        }),
    }
})()

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock next/font/google
jest.mock('next/font/google', () => ({
    Inter: () => ({ className: 'inter' }),
}))

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
})
