/**
 * Tests untuk Storage Functions
 * File: src/lib/storage.ts
 * 
 * Test Suite ini memastikan semua fungsi penyimpanan bekerja dengan benar:
 * - Email CRUD operations
 * - Master Tags management
 * - Export/Import functionality
 */

import {
    getEmails,
    saveEmails,
    addEmails,
    updateEmail,
    deleteEmail,
    deleteEmailsByBase,
    deleteAllEmails,
    getMasterTags,
    saveMasterTags,
    addMasterTag,
    removeMasterTag,
    exportData,
    importData,
    Email
} from '@/lib/storage'

// Helper to create mock emails
const createMockEmail = (overrides: Partial<Email> = {}): Email => ({
    id: 1,
    baseEmail: 'test@gmail.com',
    generatedEmail: 't.est@gmail.com',
    isUsed: false,
    usedAt: null,
    createdAt: new Date().toISOString(),
    note: null,
    tags: [],
    ...overrides
})

describe('Storage Functions - Email Operations', () => {

    describe('getEmails', () => {
        test('should return empty array when localStorage is empty', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue(null)

            const emails = getEmails()

            expect(emails).toEqual([])
            expect(localStorage.getItem).toHaveBeenCalledWith('gmail-dot-generator-emails')
        })

        test('should parse and return stored emails', () => {
            const mockEmails = [createMockEmail()]
                ; (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockEmails))

            const emails = getEmails()

            expect(emails).toEqual(mockEmails)
        })
    })

    describe('saveEmails', () => {
        test('should save emails to localStorage', () => {
            const mockEmails = [createMockEmail()]

            saveEmails(mockEmails)

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'gmail-dot-generator-emails',
                JSON.stringify(mockEmails)
            )
        })

        test('should save empty array', () => {
            saveEmails([])

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'gmail-dot-generator-emails',
                '[]'
            )
        })
    })

    describe('addEmails', () => {
        test('should add new emails and return count', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue('[]')

            const newEmails = [
                {
                    baseEmail: 'test@gmail.com',
                    generatedEmail: 't.est@gmail.com',
                    isUsed: false,
                    usedAt: null,
                    createdAt: new Date().toISOString(),
                    note: null,
                    tags: []
                }
            ]

            const result = addEmails(newEmails)

            expect(result.inserted).toBe(1)
            expect(result.total).toBe(1)
        })

        test('should skip duplicate emails', () => {
            const existingEmail = createMockEmail()
                ; (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([existingEmail]))

            const newEmails = [
                {
                    baseEmail: 'test@gmail.com',
                    generatedEmail: 't.est@gmail.com', // same as existing
                    isUsed: false,
                    usedAt: null,
                    createdAt: new Date().toISOString(),
                    note: null,
                    tags: []
                }
            ]

            const result = addEmails(newEmails)

            expect(result.inserted).toBe(0)
            expect(result.total).toBe(1)
        })

        test('should assign incremental IDs', () => {
            const existingEmail = createMockEmail({ id: 5 })
                ; (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([existingEmail]))

            const newEmails = [
                {
                    baseEmail: 'test@gmail.com',
                    generatedEmail: 'te.st@gmail.com',
                    isUsed: false,
                    usedAt: null,
                    createdAt: new Date().toISOString(),
                    note: null,
                    tags: []
                },
                {
                    baseEmail: 'test@gmail.com',
                    generatedEmail: 'tes.t@gmail.com',
                    isUsed: false,
                    usedAt: null,
                    createdAt: new Date().toISOString(),
                    note: null,
                    tags: []
                }
            ]

            addEmails(newEmails)

            // Check that setItem was called with proper IDs
            const savedData = JSON.parse(
                (localStorage.setItem as jest.Mock).mock.calls[0][1]
            )
            expect(savedData[1].id).toBe(6)
            expect(savedData[2].id).toBe(7)
        })
    })

    describe('updateEmail', () => {
        test('should update existing email', () => {
            const existingEmail = createMockEmail()
                ; (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([existingEmail]))

            updateEmail(1, { isUsed: true, usedAt: '2024-01-01' })

            const savedData = JSON.parse(
                (localStorage.setItem as jest.Mock).mock.calls[0][1]
            )
            expect(savedData[0].isUsed).toBe(true)
            expect(savedData[0].usedAt).toBe('2024-01-01')
        })

        test('should not modify anything if email not found', () => {
            const existingEmail = createMockEmail()
                ; (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([existingEmail]))

            updateEmail(999, { isUsed: true })

            // setItem should not be called if email not found
            expect(localStorage.setItem).not.toHaveBeenCalled()
        })

        test('should preserve other email properties', () => {
            const existingEmail = createMockEmail({ note: 'Important' })
                ; (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([existingEmail]))

            updateEmail(1, { isUsed: true })

            const savedData = JSON.parse(
                (localStorage.setItem as jest.Mock).mock.calls[0][1]
            )
            expect(savedData[0].note).toBe('Important')
            expect(savedData[0].isUsed).toBe(true)
        })
    })

    describe('deleteEmail', () => {
        test('should delete email by id', () => {
            const emails = [
                createMockEmail({ id: 1 }),
                createMockEmail({ id: 2, generatedEmail: 'te.st@gmail.com' })
            ]
                ; (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(emails))

            deleteEmail(1)

            const savedData = JSON.parse(
                (localStorage.setItem as jest.Mock).mock.calls[0][1]
            )
            expect(savedData.length).toBe(1)
            expect(savedData[0].id).toBe(2)
        })
    })

    describe('deleteEmailsByBase', () => {
        test('should delete all emails with matching base email', () => {
            const emails = [
                createMockEmail({ id: 1, baseEmail: 'test@gmail.com' }),
                createMockEmail({ id: 2, baseEmail: 'test@gmail.com', generatedEmail: 'te.st@gmail.com' }),
                createMockEmail({ id: 3, baseEmail: 'other@gmail.com', generatedEmail: 'ot.her@gmail.com' })
            ]
                ; (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(emails))

            deleteEmailsByBase('test@gmail.com')

            const savedData = JSON.parse(
                (localStorage.setItem as jest.Mock).mock.calls[0][1]
            )
            expect(savedData.length).toBe(1)
            expect(savedData[0].baseEmail).toBe('other@gmail.com')
        })
    })

    describe('deleteAllEmails', () => {
        test('should clear all emails', () => {
            deleteAllEmails()

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'gmail-dot-generator-emails',
                '[]'
            )
        })
    })
})

describe('Storage Functions - Master Tags', () => {
    const DEFAULT_TAGS = ['google', 'netflix', 'facebook', 'twitter', 'amazon']

    describe('getMasterTags', () => {
        test('should return default tags when localStorage is empty', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue(null)

            const tags = getMasterTags()

            expect(tags).toEqual(DEFAULT_TAGS)
        })

        test('should return stored tags', () => {
            const customTags = ['custom', 'tags']
                ; (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(customTags))

            const tags = getMasterTags()

            expect(tags).toEqual(customTags)
        })
    })

    describe('saveMasterTags', () => {
        test('should save tags to localStorage', () => {
            const tags = ['tag1', 'tag2']

            saveMasterTags(tags)

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'gmail-dot-generator-master-tags',
                JSON.stringify(tags)
            )
        })
    })

    describe('addMasterTag', () => {
        test('should add new tag', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(['existing']))

            addMasterTag('newtag')

            const savedData = JSON.parse(
                (localStorage.setItem as jest.Mock).mock.calls[0][1]
            )
            expect(savedData).toContain('newtag')
        })

        test('should normalize tag to lowercase', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(['existing']))

            addMasterTag('NEWTAG')

            const savedData = JSON.parse(
                (localStorage.setItem as jest.Mock).mock.calls[0][1]
            )
            expect(savedData).toContain('newtag')
            expect(savedData).not.toContain('NEWTAG')
        })

        test('should trim whitespace', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(['existing']))

            addMasterTag('  newtag  ')

            const savedData = JSON.parse(
                (localStorage.setItem as jest.Mock).mock.calls[0][1]
            )
            expect(savedData).toContain('newtag')
        })

        test('should not add duplicate tag', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(['existing']))

            addMasterTag('existing')

            expect(localStorage.setItem).not.toHaveBeenCalled()
        })

        test('should not add empty tag', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(['existing']))

            addMasterTag('')

            expect(localStorage.setItem).not.toHaveBeenCalled()
        })

        test('should sort tags alphabetically after adding', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(['zebra', 'alpha']))

            addMasterTag('middle')

            const savedData = JSON.parse(
                (localStorage.setItem as jest.Mock).mock.calls[0][1]
            )
            expect(savedData).toEqual(['alpha', 'middle', 'zebra'])
        })
    })

    describe('removeMasterTag', () => {
        test('should remove tag', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(['tag1', 'tag2', 'tag3']))

            removeMasterTag('tag2')

            const savedData = JSON.parse(
                (localStorage.setItem as jest.Mock).mock.calls[0][1]
            )
            expect(savedData).toEqual(['tag1', 'tag3'])
        })

        test('should handle removing non-existent tag gracefully', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(['tag1', 'tag2']))

            removeMasterTag('nonexistent')

            const savedData = JSON.parse(
                (localStorage.setItem as jest.Mock).mock.calls[0][1]
            )
            expect(savedData).toEqual(['tag1', 'tag2'])
        })
    })
})

describe('Storage Functions - Export/Import', () => {

    describe('exportData', () => {
        test('should export emails as JSON string', () => {
            const emails = [createMockEmail()]
                ; (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(emails))

            const exported = exportData()

            expect(typeof exported).toBe('string')
            const parsed = JSON.parse(exported)
            expect(parsed).toEqual(emails)
        })

        test('should format JSON with indentation', () => {
            const emails = [createMockEmail()]
                ; (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(emails))

            const exported = exportData()

            expect(exported).toContain('\n')
        })
    })

    describe('importData', () => {
        test('should import valid JSON array', () => {
            const emails = [createMockEmail()]

            const result = importData(JSON.stringify(emails))

            expect(result).toBe(true)
            expect(localStorage.setItem).toHaveBeenCalled()
        })

        test('should reject non-array JSON', () => {
            const result = importData(JSON.stringify({ not: 'an array' }))

            expect(result).toBe(false)
        })

        test('should reject invalid JSON', () => {
            const result = importData('not valid json')

            expect(result).toBe(false)
        })

        test('should reject empty string', () => {
            const result = importData('')

            expect(result).toBe(false)
        })

        test('should accept empty array', () => {
            const result = importData('[]')

            expect(result).toBe(true)
        })
    })
})

describe('Edge Cases and Integration', () => {

    test('should handle concurrent operations', () => {
        const email1 = createMockEmail({ id: 1 })
        const email2 = createMockEmail({ id: 2, generatedEmail: 'te.st@gmail.com' })
            ; (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([email1, email2]))

        // Update and delete in sequence
        updateEmail(1, { isUsed: true })

            // Simulate getItem returning the updated state
            ; (localStorage.getItem as jest.Mock).mockReturnValue(
                (localStorage.setItem as jest.Mock).mock.calls[0][1]
            )

        deleteEmail(2)

        const finalData = JSON.parse(
            (localStorage.setItem as jest.Mock).mock.calls[1][1]
        )
        expect(finalData.length).toBe(1)
        expect(finalData[0].isUsed).toBe(true)
    })

    test('Email interface should have all required fields', () => {
        const email: Email = createMockEmail()

        expect(email).toHaveProperty('id')
        expect(email).toHaveProperty('baseEmail')
        expect(email).toHaveProperty('generatedEmail')
        expect(email).toHaveProperty('isUsed')
        expect(email).toHaveProperty('usedAt')
        expect(email).toHaveProperty('createdAt')
        expect(email).toHaveProperty('note')
        expect(email).toHaveProperty('tags')
    })
})
