/**
 * Tests untuk Email Generator Functions
 * File: src/lib/generator.ts
 * 
 * Test Suite ini memastikan semua fungsi generasi email bekerja dengan benar:
 * - Dot variation generation
 * - Plus mode generation  
 * - Mixed mode generation
 * - Gmail validation
 */

import {
    generateVariations,
    generateDotVariations,
    isValidGmail,
    GenerationMode
} from '@/lib/generator'

describe('Email Generator Functions', () => {

    describe('generateVariations - Dot Mode', () => {
        test('should generate dot variations for simple email', () => {
            const email = 'abc@gmail.com'
            const variations = generateVariations(email, 'dot')

            // abc has 2 characters between, so 2^2 = 4 variations, minus original = 3
            expect(variations.length).toBeGreaterThanOrEqual(1)
            expect(variations).toContain('a.bc@gmail.com')
            expect(variations).toContain('ab.c@gmail.com')
            expect(variations).toContain('a.b.c@gmail.com')
        })

        test('should handle email with existing dots', () => {
            const email = 'a.b.c@gmail.com'
            const variations = generateVariations(email, 'dot')

            // Should clean dots first and regenerate
            expect(variations.length).toBeGreaterThanOrEqual(1)
        })

        test('should handle single character username', () => {
            const email = 'a@gmail.com'
            const variations = generateVariations(email, 'dot')

            // Single character can't have dots
            expect(variations).toContain('a@gmail.com')
            expect(variations.length).toBe(1)
        })

        test('should handle two character username', () => {
            const email = 'ab@gmail.com'
            const variations = generateVariations(email, 'dot')

            // Two characters: only one possible dot position
            expect(variations).toContain('a.b@gmail.com')
        })

        test('should throw error for invalid email format', () => {
            expect(() => generateVariations('invalid-email', 'dot'))
                .toThrow('Invalid email format')
        })

        test('should throw error for email without domain', () => {
            expect(() => generateVariations('test@', 'dot'))
                .toThrow('Invalid email format')
        })

        test('should sort variations by number of dots', () => {
            const email = 'abcd@gmail.com'
            const variations = generateVariations(email, 'dot')

            // Check if sorted: fewer dots come first
            for (let i = 1; i < variations.length; i++) {
                const prevDots = (variations[i - 1].match(/\./g) || []).length
                const currDots = (variations[i].match(/\./g) || []).length
                expect(currDots).toBeGreaterThanOrEqual(prevDots)
            }
        })
    })

    describe('generateVariations - Plus Mode', () => {
        test('should generate email with plus tag', () => {
            const email = 'myemail@gmail.com'
            const tag = 'netflix'
            const variations = generateVariations(email, 'plus', tag)

            expect(variations.length).toBe(1)
            expect(variations[0]).toBe('myemail+netflix@gmail.com')
        })

        test('should clean existing dots in username for plus mode', () => {
            const email = 'my.email@gmail.com'
            const tag = 'work'
            const variations = generateVariations(email, 'plus', tag)

            expect(variations.length).toBe(1)
            expect(variations[0]).toBe('myemail+work@gmail.com')
        })

        test('should throw error when tag is missing in plus mode', () => {
            expect(() => generateVariations('test@gmail.com', 'plus'))
                .toThrow('Tag is required for Plus mode')
        })

        test('should throw error when tag is empty string in plus mode', () => {
            expect(() => generateVariations('test@gmail.com', 'plus', ''))
                .toThrow('Tag is required for Plus mode')
        })

        test('should handle tag with special characters', () => {
            const email = 'test@gmail.com'
            const tag = 'my-shopping-list'
            const variations = generateVariations(email, 'plus', tag)

            expect(variations[0]).toBe('test+my-shopping-list@gmail.com')
        })
    })

    describe('generateVariations - Mixed Mode', () => {
        test('should generate dot variations with tag', () => {
            const email = 'abc@gmail.com'
            const tag = 'work'
            const variations = generateVariations(email, 'mixed', tag)

            expect(variations.length).toBeGreaterThanOrEqual(1)
            // All variations should contain the tag
            variations.forEach((v: string) => {
                expect(v).toContain('+work@gmail.com')
            })
        })

        test('should include dot variations with plus tag', () => {
            const email = 'ab@gmail.com'
            const tag = 'test'
            const variations = generateVariations(email, 'mixed', tag)

            expect(variations).toContain('a.b+test@gmail.com')
        })

        test('should throw error when tag is missing in mixed mode', () => {
            expect(() => generateVariations('test@gmail.com', 'mixed'))
                .toThrow('Tag is required for Mixed mode')
        })

        test('should sort mixed results by number of dots', () => {
            const email = 'abcd@gmail.com'
            const variations = generateVariations(email, 'mixed', 'tag')

            for (let i = 1; i < variations.length; i++) {
                const prevDots = (variations[i - 1].match(/\./g) || []).length
                const currDots = (variations[i].match(/\./g) || []).length
                expect(currDots).toBeGreaterThanOrEqual(prevDots)
            }
        })
    })

    describe('generateDotVariations helper', () => {
        test('should be equivalent to calling generateVariations with dot mode', () => {
            const email = 'test@gmail.com'
            const fromHelper = generateDotVariations(email)
            const fromMain = generateVariations(email, 'dot')

            expect(fromHelper).toEqual(fromMain)
        })
    })

    describe('isValidGmail', () => {
        test('should return true for valid gmail addresses', () => {
            expect(isValidGmail('test@gmail.com')).toBe(true)
            expect(isValidGmail('myemail@gmail.com')).toBe(true)
            expect(isValidGmail('user123@gmail.com')).toBe(true)
        })

        test('should return true for gmail with dots (cleaned internally)', () => {
            expect(isValidGmail('test.email@gmail.com')).toBe(true)
            expect(isValidGmail('my.long.email@gmail.com')).toBe(true)
        })

        test('should return false for non-gmail domains', () => {
            expect(isValidGmail('test@yahoo.com')).toBe(false)
            expect(isValidGmail('test@outlook.com')).toBe(false)
            expect(isValidGmail('test@hotmail.com')).toBe(false)
        })

        test('should return false for invalid email formats', () => {
            expect(isValidGmail('not-an-email')).toBe(false)
            expect(isValidGmail('@gmail.com')).toBe(false)
            expect(isValidGmail('test@')).toBe(false)
        })

        test('should return false for gmail with special characters', () => {
            expect(isValidGmail('test+tag@gmail.com')).toBe(false)
            expect(isValidGmail('test_email@gmail.com')).toBe(false)
            expect(isValidGmail('test-email@gmail.com')).toBe(false)
        })

        test('should handle case insensitivity', () => {
            expect(isValidGmail('TEST@gmail.com')).toBe(true)
            expect(isValidGmail('test@GMAIL.com')).toBe(true)
            expect(isValidGmail('Test@Gmail.Com')).toBe(true)
        })
    })

    describe('Edge Cases', () => {
        test('should handle long usernames', () => {
            const email = 'abcdefghij@gmail.com' // 10 characters = 2^9 = 512 variations
            const variations = generateVariations(email, 'dot')

            expect(variations.length).toBeGreaterThan(100)
        })

        test('should not produce duplicate variations', () => {
            const email = 'abcd@gmail.com'
            const variations = generateVariations(email, 'dot')
            const uniqueVariations = new Set(variations)

            expect(variations.length).toBe(uniqueVariations.size)
        })

        test('should preserve domain correctly', () => {
            const email = 'test@gmail.com'
            const variations = generateVariations(email, 'dot')

            variations.forEach((v: string) => {
                expect(v).toMatch(/@gmail\.com$/)
            })
        })
    })
})
