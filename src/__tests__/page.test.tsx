import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '@/app/page'

// Mock crypto
const mockGetRandomValues = jest.fn()
Object.defineProperty(window, 'crypto', {
    writable: true,
    value: {
        getRandomValues: mockGetRandomValues
    }
})

// Mock clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(),
    },
})

// Verify window.matchMedia mock exists
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = jest.fn()

describe('Home Page', () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks()

        // Mock crypto behavior
        mockGetRandomValues.mockImplementation((arr: Uint32Array) => {
            arr[0] = 0 // deterministic random
            return arr
        })

        // Mock localStorage implementation working on top of jest.setup.js
        let store: Record<string, string> = {}

        // Access existing mocks on window.localStorage
        const ls = window.localStorage as unknown as { getItem: jest.Mock; setItem: jest.Mock; clear: jest.Mock };

        ls.getItem.mockImplementation((key: string) => store[key] || null)
        ls.setItem.mockImplementation((key: string, value: string) => {
            store[key] = value.toString()
        })
        ls.clear.mockImplementation(() => {
            store = {}
        })
    })

    test('renders generating form', () => {
        render(<Home />)
        expect(screen.getByText('emailku')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Enter Gmail address...')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'GENERATE' })).toBeInTheDocument()
    })

    test('generates emails successfully', async () => {
        render(<Home />)

        // Type email
        const input = screen.getByPlaceholderText('Enter Gmail address...')
        fireEvent.change(input, { target: { value: 'ab@gmail.com' } })

        // Click Generate
        const generateBtn = screen.getByRole('button', { name: 'GENERATE' })
        fireEvent.click(generateBtn)

        // Wait for "Generated x email variations!" toast
        await waitFor(() => {
            expect(screen.getByText(/Generated 1 email variations/i)).toBeInTheDocument()
        })

        // Check if result appears - use textContent because text is split into spans
        const emailElements = screen.getAllByText((_, element) => element?.textContent === 'a.b@gmail.com')
        expect(emailElements.length).toBeGreaterThan(0)

        // Check Stats
        const totalLabel = screen.getByText('TOTAL')
        expect(totalLabel.parentElement).toHaveTextContent('1')
    })

    test('handles invalid email', () => {
        render(<Home />)
        const input = screen.getByPlaceholderText('Enter Gmail address...')
        fireEvent.change(input, { target: { value: 'invalid-email' } })

        const generateBtn = screen.getByRole('button', { name: 'GENERATE' })
        fireEvent.click(generateBtn)

        expect(screen.getByText('Invalid Gmail address')).toBeInTheDocument()
    })

    test('picks random email', async () => {
        render(<Home />)

        // Generate email first
        const input = screen.getByPlaceholderText('Enter Gmail address...')
        fireEvent.change(input, { target: { value: 'ab@gmail.com' } })
        fireEvent.click(screen.getByRole('button', { name: 'GENERATE' }))

        await waitFor(() => {
            const emailElements = screen.getAllByText((_, element) => element?.textContent === 'a.b@gmail.com')
            expect(emailElements.length).toBeGreaterThan(0)
        })

        // Press Ctrl + R (Pick Random)
        fireEvent.keyDown(window, { key: 'r', ctrlKey: true })

        // Should call crypto
        expect(mockGetRandomValues).toHaveBeenCalled()

        // Should show toast
        await waitFor(() => {
            expect(screen.getByText(/Copied & marked used/i)).toBeInTheDocument()
        })
    })

    test('opens and closes settings modal', async () => {
        render(<Home />)

        // Open settings
        const settingsBtn = screen.getByLabelText('Master Tag Settings')
        fireEvent.click(settingsBtn)

        expect(screen.getByText(/Master Tags/i)).toBeInTheDocument()

        // Add tag
        const tagInput = screen.getByPlaceholderText('Add new tag...')
        fireEvent.change(tagInput, { target: { value: 'new-tag' } })
        const addBtn = screen.getByRole('button', { name: 'ADD' })
        fireEvent.click(addBtn)

        expect(screen.getByText('new-tag')).toBeInTheDocument()

        // Close
        const doneBtn = screen.getByRole('button', { name: 'Done' })
        fireEvent.click(doneBtn)

        expect(screen.queryByText('Master Tags')).not.toBeInTheDocument()
    })

    test('shortcuts modal', async () => {
        render(<Home />)

        // Press ? key
        fireEvent.keyDown(window, { key: '?' })

        expect(screen.getByText('Shortcuts')).toBeInTheDocument()

        // Close by backdrop
        const backdrop = screen.getByLabelText('Close shortcuts modal')
        fireEvent.click(backdrop)

        expect(screen.queryByText('Shortcuts')).not.toBeInTheDocument()
    })

    test('toggles dark mode', () => {
        render(<Home />)
        const toggleBtn = screen.getByLabelText('Toggle dark mode')

        // Initial state
        expect(document.documentElement.classList.contains('dark')).toBeFalsy()

        // Toggle
        fireEvent.click(toggleBtn)
    })

    test('search and pagination', async () => {
        render(<Home />)

        // Generate many emails
        const input = screen.getByPlaceholderText('Enter Gmail address...')
        fireEvent.change(input, { target: { value: 'long.email.address.test@gmail.com' } })
        fireEvent.click(screen.getByRole('button', { name: 'GENERATE' }))

        await waitFor(() => {
            expect(screen.getByText(/Generated \d+ email variations/i)).toBeInTheDocument()
        })

        // Search
        const searchInput = screen.getByPlaceholderText('Search emails...')
        fireEvent.change(searchInput, { target: { value: 'l.o.n.g' } })

        // Pagination
        const pageSizeSelect = screen.getByRole('combobox', { name: /Show items per page/i })
        fireEvent.change(pageSizeSelect, { target: { value: '25' } })
        expect(pageSizeSelect).toHaveValue('25')
    }, 10000)

    test('email actions: delete, status', async () => {
        render(<Home />)

        // Generate 
        const input = screen.getByPlaceholderText('Enter Gmail address...')
        fireEvent.change(input, { target: { value: 'abc@gmail.com' } })
        fireEvent.click(screen.getByRole('button', { name: 'GENERATE' }))

        await waitFor(() => {
            expect(screen.getByText(/Generated \d+ email variations/i)).toBeInTheDocument()
        })

        // Wait for list to render actions
        await waitFor(() => {
            expect(screen.getAllByRole('button', { name: /Mark as used/i }).length).toBeGreaterThan(0)
        })

        // 1. Toggle Status (Available -> Used)
        const statusBtn = screen.getAllByRole('button', { name: /Mark as used/i })[0]
        fireEvent.click(statusBtn)

        await waitFor(() => {
            expect(window.localStorage.setItem).toHaveBeenCalled()
        })

        // 3. Delete Single
        const deleteBtns = screen.getAllByRole('button', { name: /Delete email/i })

        window.confirm = jest.fn(() => true) // Mock confirm
        fireEvent.click(deleteBtns[0])

        await waitFor(() => {
            expect(window.localStorage.setItem).toHaveBeenCalled()
            expect(screen.getByText('Email deleted')).toBeInTheDocument()
        })
    })

    test('csv export', async () => {
        render(<Home />)
        // Generate
        const input = screen.getByPlaceholderText('Enter Gmail address...')
        fireEvent.change(input, { target: { value: 'abc@gmail.com' } })
        fireEvent.click(screen.getByRole('button', { name: 'GENERATE' }))

        await waitFor(() => expect(screen.getByText(/Generated/i)).toBeInTheDocument())

        // Click Export (Trigger via shortcut key as button might be icon-only or hidden)
        fireEvent.keyDown(window, { key: 'e', ctrlKey: true })

        expect(global.URL.createObjectURL).toHaveBeenCalled()
        expect(screen.getByText('CSV exported!')).toBeInTheDocument()
    })
})
