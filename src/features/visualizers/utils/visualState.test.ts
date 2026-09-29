import { initialVisualizer } from '../store/visualizerSlice'
import type { SavedVisual } from '../types/visual.types'
import { visualToBuilderState } from './visualState'

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
            params: { dimension: ['dx:a;b', 'pe:LAST_12_MONTHS'], filter: 'ou:ou1;LEVEL-2' },
        },
    },
    analyticsPayloadDeterminer: {
        Columns: ['Period'],
        Rows: ['Data'],
        Filter: ['Organisation unit'],
    },
    dataSourceId: 'ext',
    createdBy: { id: 'u', name: 'U' },
    updatedBy: { id: 'u', name: 'U' },
    createdAt: 1,
    updatedAt: 1,
    organizationTree: ['/root/ou1'],
    selectedOrgUnitLevel: [2],
    backedSelectedItems: [{ id: 'a', label: 'A' }],
} as SavedVisual

describe('visualToBuilderState', () => {
    const dataSource = { isCurrentInstance: false, instanceName: 'Ext', url: 'u', token: 't' }
    const state = visualToBuilderState(visual, dataSource)

    it('restores the selection', () => {
        expect(state.selection).toMatchObject({
            dataSourceId: 'ext',
            dataSource,
            dimensions: { dx: ['a', 'b'], pe: ['LAST_12_MONTHS'] },
            layout: visual.analyticsPayloadDeterminer,
            selectedDataItems: [{ id: 'a', label: 'A' }],
        })
    })

    it('restores the org units from the saved filter', () => {
        expect(state.orgUnits).toMatchObject({
            useCurrentUserOrgUnits: false,
            selectedOrgUnitIds: ['ou1'],
            selectedLevelIds: ['2'],
            selectedTreePaths: ['/root/ou1'],
            selectedLevels: [2],
        })
    })

    it('restores the appearance', () => {
        expect(state.visualizer.chartType).toBe('Line')
        expect(state.visualizer.colorPalette).toEqual(initialVisualizer.settings.visualColorPalette)
    })
})
