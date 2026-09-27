import type { SavedVisualEntry } from '../types/visual.types'
import { isVisualNameTaken } from './visualNames'

const entry = (key: string, visualName: string) =>
    ({ key, value: { visualName } }) as SavedVisualEntry

describe('isVisualNameTaken', () => {
    const visuals = [entry('a', 'ANC coverage'), entry('b', 'Malaria cases')]

    it('detects duplicates regardless of case and spaces', () => {
        expect(isVisualNameTaken(visuals, '  anc COVERAGE ')).toBe(true)
        expect(isVisualNameTaken(visuals, 'New one')).toBe(false)
    })

    it('ignores the visual being edited', () => {
        expect(isVisualNameTaken(visuals, 'ANC coverage', 'a')).toBe(false)
    })
})
