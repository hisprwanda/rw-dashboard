import { bulletinSectionSchema } from '../schemas/bulletinTemplateSchema'
import { move, newSection, SECTION_TYPES } from './newSection'

describe('newSection', () => {
    it('creates a valid section of every type', () => {
        for (const type of SECTION_TYPES) {
            const section = newSection(type)
            expect(section.type).toBe(type)
            expect(bulletinSectionSchema.safeParse(section).success).toBe(true)
        }
    })

    it('gives every section its own id', () => {
        expect(newSection('text').id).not.toBe(newSection('text').id)
    })
})

describe('move', () => {
    it('moves items up and down within bounds', () => {
        expect(move(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b'])
        expect(move(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c'])
        expect(move(['a', 'b'], 0, -1)).toEqual(['a', 'b'])
    })
})
