import { filterApps, initialsOf, isInGlobalShell, joinUrl } from './links'

describe('navigation utils', () => {
    it('joins the base URL with relative server paths', () => {
        expect(joinUrl('http://x/dhis/', '/api/icons/a.png')).toBe('http://x/dhis/api/icons/a.png')
        expect(joinUrl('http://x', '../dhis-web-maps/index.html')).toBe(
            'http://x/dhis-web-maps/index.html'
        )
        expect(joinUrl('http://x', 'https://y/app')).toBe('https://y/app')
    })

    it('makes initials', () => {
        expect(initialsOf('John Traore')).toBe('JT')
        expect(initialsOf('admin')).toBe('A')
        expect(initialsOf(undefined)).toBe('')
    })

    it('filters apps by display name', () => {
        const apps = [
            { name: 'a', displayName: 'Maps' },
            { name: 'b', displayName: 'Data Entry' },
        ]
        expect(filterApps(apps, 'map').map((a) => a.name)).toEqual(['a'])
        expect(filterApps(apps, ' ')).toHaveLength(2)
    })

    it('is in the Global Shell only when loaded in another page', () => {
        const page = {}
        expect(isInGlobalShell({ self: page, top: page })).toBe(false)
        expect(isInGlobalShell({ self: page, top: {} })).toBe(true)
        expect(isInGlobalShell()).toBe(false)
    })
})
