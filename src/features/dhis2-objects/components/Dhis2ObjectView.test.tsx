import { act, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/shared/testing'
import { Dhis2ObjectView } from './Dhis2ObjectView'
import { PLUGIN_HANDSHAKE_MS } from './Dhis2PluginView'

const PLUGIN = 'https://dhis2.example.org/dhis-web-data-visualizer/plugin.html'

const pivotTable = {
    id: 'pt1',
    name: 'ANC by district',
    type: 'PIVOT_TABLE',
    columns: [{ dimension: 'dx', items: [{ id: 'anc1' }] }],
    rows: [{ dimension: 'ou', items: [{ id: 'bo' }, { id: 'ke' }] }],
    filters: [{ dimension: 'pe', items: [{ id: 'LAST_YEAR' }] }],
    rowTotals: false,
    colTotals: true,
}

const analytics = {
    headers: [
        { name: 'dx', column: 'Data', meta: true },
        { name: 'ou', column: 'Organisation unit', meta: true },
        { name: 'value', column: 'Value', meta: false },
    ],
    rows: [
        ['anc1', 'bo', '1200'],
        ['anc1', 'ke', '800'],
    ],
    metaData: {
        items: { anc1: { name: 'ANC 1st visit' }, bo: { name: 'Bo' }, ke: { name: 'Kenema' } },
        dimensions: { dx: ['anc1'], ou: ['bo', 'ke'], pe: ['2025'] },
    },
    width: 3,
    height: 2,
}

const view = (
    <Dhis2ObjectView objectType="visualization" objectId="pt1" name="ANC" dataSourceId="1" />
)

describe('Dhis2ObjectView (current instance)', () => {
    it('hands the favorite to the official plugin when the app has one', async () => {
        const { container } = renderWithProviders(view, {
            data: {
                apps: [{ key: 'data-visualizer', pluginLaunchUrl: PLUGIN }],
                'visualizations/pt1': pivotTable,
                me: { id: 'u1', settings: {} },
            },
        })
        await waitFor(() => expect(container.querySelector('iframe')).not.toBeNull())
        expect(container.querySelector('iframe')?.getAttribute('src')).toBe(PLUGIN)
    })

    it('draws a pivot table itself when there is no plugin (DHIS2 < 2.40)', async () => {
        renderWithProviders(view, {
            data: {
                apps: [],
                'visualizations/pt1': pivotTable,
                analytics,
                me: { id: 'u1', settings: {} },
            },
        })
        expect(await screen.findByText('Kenema')).toBeTruthy()
        expect(screen.getByText('ANC 1st visit')).toBeTruthy()
        // Column total of 1,200 + 800.
        expect(screen.getByText('2,000')).toBeTruthy()
    })

    it('draws the favorite itself when the plugin stays silent (frame refused)', async () => {
        jest.useFakeTimers()
        try {
            const { container } = renderWithProviders(view, {
                data: {
                    apps: [{ key: 'data-visualizer', pluginLaunchUrl: PLUGIN }],
                    'visualizations/pt1': pivotTable,
                    analytics,
                    me: { id: 'u1', settings: {} },
                },
            })
            await waitFor(() => expect(container.querySelector('iframe')).not.toBeNull())
            act(() => {
                jest.advanceTimersByTime(PLUGIN_HANDSHAKE_MS + 1)
            })
            expect(await screen.findByText('Kenema')).toBeTruthy()
            expect(container.querySelector('iframe')).toBeNull()
        } finally {
            jest.useRealTimers()
        }
    })
})
