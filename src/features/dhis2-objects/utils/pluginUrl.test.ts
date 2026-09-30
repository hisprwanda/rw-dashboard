import { pluginUrl } from './pluginUrl'

const contextPath = 'https://play.im.dhis2.org/stable-2-43-1'
const apps = [
    {
        key: 'data-visualizer',
        pluginLaunchUrl: `${contextPath}/dhis-web-data-visualizer/plugin.html`,
    },
    { key: 'maps', pluginLaunchUrl: `${contextPath}/dhis-web-maps/plugin.html` },
    { key: 'datastore' },
]

describe('pluginUrl', () => {
    it('rebases the plugin on the app base url (development proxy)', () => {
        expect(
            pluginUrl({
                apps,
                objectType: 'visualization',
                baseUrl: 'http://localhost:8080',
                contextPath,
                pageUrl: 'http://localhost:3000/',
            })
        ).toBe('http://localhost:8080/dhis-web-data-visualizer/plugin.html')
    })

    it('resolves a relative base url against the page (installed app)', () => {
        expect(
            pluginUrl({
                apps,
                objectType: 'map',
                baseUrl: '../../..',
                contextPath,
                pageUrl: `${contextPath}/api/apps/data-analytics-lab/index.html`,
            })
        ).toBe(`${contextPath}/dhis-web-maps/plugin.html`)
    })

    it('is null without the app or its plugin', () => {
        const args = { baseUrl: '..', contextPath, pageUrl: 'http://x/' }
        expect(pluginUrl({ ...args, apps: [], objectType: 'map' })).toBeNull()
        expect(pluginUrl({ ...args, apps: undefined, objectType: 'visualization' })).toBeNull()
    })
})
