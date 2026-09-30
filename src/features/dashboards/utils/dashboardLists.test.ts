import type { SavedDashboard, SavedDashboardEntry } from '../types/dashboard.types'
import { isPinnedFor, sortByFavorite, toggleFavorite } from './dashboardLists'

const entry = (key: string, value: Partial<SavedDashboard>): SavedDashboardEntry => ({
    key,
    value: {
        dashboardName: key,
        createdBy: { id: 'owner', name: 'Owner' },
        updatedBy: { id: 'owner', name: 'Owner' },
        createdAt: 1,
        updatedAt: 1,
        selectedVisuals: [],
        ...value,
    },
})

describe('sortByFavorite', () => {
    it('puts favorites first, then sorts by name', () => {
        const sorted = sortByFavorite(
            [entry('b', {}), entry('c', { favorites: ['me'] }), entry('a', {})],
            'me'
        )
        expect(sorted.map((e) => e.key)).toEqual(['c', 'a', 'b'])
    })
})

describe('isPinnedFor', () => {
    it('pins official dashboards the user owns or can see', () => {
        expect(isPinnedFor(entry('x', { isOfficialDashboard: true }), 'owner', [])).toBe(true)
        expect(
            isPinnedFor(
                entry('x', { isOfficialDashboard: true, generalDashboardAccess: 'View only' }),
                'me',
                []
            )
        ).toBe(true)
        expect(
            isPinnedFor(
                entry('x', {
                    isOfficialDashboard: true,
                    sharing: [{ id: 'g1', type: 'Group' }],
                }),
                'me',
                ['g1']
            )
        ).toBe(true)
    })

    it('does not pin unofficial or invisible dashboards', () => {
        expect(isPinnedFor(entry('x', {}), 'owner', [])).toBe(false)
        expect(isPinnedFor(entry('x', { isOfficialDashboard: true }), 'me', [])).toBe(false)
    })
})

describe('toggleFavorite', () => {
    it('adds and removes the user', () => {
        expect(toggleFavorite(undefined, 'me')).toEqual(['me'])
        expect(toggleFavorite(['me', 'you'], 'me')).toEqual(['you'])
    })
})
