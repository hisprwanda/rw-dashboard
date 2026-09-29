import { waitFor } from '@testing-library/react'
import { renderHookWithProviders } from '@/shared/testing'
import { initialVisualizer } from '../store/visualizerSlice'
import { useVisualBuilder } from './useVisualBuilder'

const visual = {
    id: 'v1',
    visualName: 'ANC',
    description: '',
    visualType: 'Line',
    visualTitleAndSubTitle: initialVisualizer.titles,
    visualSettings: initialVisualizer.settings,
    query: {
        myData: {
            resource: 'analytics',
            params: { dimension: ['dx:a', 'pe:LAST_12_MONTHS'], filter: 'ou:USER_ORGUNIT' },
        },
    },
    analyticsPayloadDeterminer: {
        Columns: ['Data'],
        Rows: ['Period'],
        Filter: ['Organisation unit'],
    },
    dataSourceId: '1',
    createdBy: { id: 'u', name: 'U' },
    updatedBy: { id: 'u', name: 'U' },
    createdAt: 1,
    updatedAt: 1,
    backedSelectedItems: [{ id: 'a', label: 'ANC' }],
}

const analytics = {
    headers: [],
    rows: [],
    metaData: {
        items: { LAST_12_MONTHS: { name: 'Last 12 months' } },
        dimensions: { pe: ['LAST_12_MONTHS'] },
    },
    width: 0,
    height: 0,
}

const data = {
    'dataStore/VISUALS_STORE/v1': visual,
    'dataStore/DATA_SOURCES_STORE': { entries: [] },
    'systemSettings/applicationTitle': { applicationTitle: 'Sierra Leone' },
    analytics,
}

describe('useVisualBuilder', () => {
    it('loads a saved visual into the store and runs its analytics', async () => {
        const { result, store } = renderHookWithProviders(() => useVisualBuilder('v1'), { data })
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        const state = store.getState()
        expect(state.visualizer.chartType).toBe('Line')
        expect(state.selection.dimensions).toEqual({ dx: ['a'], pe: ['LAST_12_MONTHS'] })
        expect(state.selection.selectedDataItems).toEqual([{ id: 'a', label: 'ANC' }])
        expect(state.orgUnitSelection.useCurrentUserOrgUnits).toBe(true)
        await waitFor(() => expect(result.current.analytics.data).toBeDefined())
    })

    it('starts a new visual from a clean state', async () => {
        const { result, store } = renderHookWithProviders(() => useVisualBuilder(undefined), {
            data,
        })
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(store.getState().selection.dimensions).toEqual({ dx: [], pe: ['LAST_12_MONTHS'] })
        expect(result.current.analytics.data).toBeUndefined()
    })
})
