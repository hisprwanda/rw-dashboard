import type { SavedMapEntry } from '@/features/maps'
import type { SavedVisualEntry } from '@/features/visualizers'
import {
    dashboardEditorActions as actions,
    dashboardEditorReducer as reducer,
    initialDashboardEditor,
} from '../store/dashboardEditorSlice'
import {
    buildDashboard,
    inReadingOrder,
    nextPosition,
    toDhis2Item,
    toMapItem,
    toVisualItem,
    withGridLayout,
} from './dashboardItems'

const visual = {
    key: 'v1',
    value: {
        visualName: 'ANC',
        visualType: 'Line',
        query: { myData: { resource: 'analytics', params: {} } },
        analyticsPayloadDeterminer: { Columns: [], Rows: [], Filter: [] },
        visualSettings: {},
        visualTitleAndSubTitle: {},
        dataSourceId: '1',
    },
} as unknown as SavedVisualEntry

const map = {
    key: 'm1',
    value: {
        mapName: 'Districts',
        mapType: 'Thematic',
        dataSourceId: '1',
        queries: { geoFeaturesQuery: {}, mapAnalyticsQueryOne: {}, mapAnalyticsQueryTwo: {} },
    },
} as unknown as SavedMapEntry

describe('dashboard items', () => {
    it('places four tiles per row', () => {
        expect(nextPosition(0)).toEqual({ x: 0, y: 0, w: 3, h: 3 })
        expect(nextPosition(3)).toEqual({ x: 9, y: 0, w: 3, h: 3 })
        expect(nextPosition(4)).toEqual({ x: 0, y: 3, w: 3, h: 3 })
    })

    it('copies the saved visual and map into items', () => {
        expect(toVisualItem(visual, 0)).toMatchObject({
            i: 'v1',
            visualName: 'ANC',
            visualType: 'Line',
        })
        expect(toMapItem(map, 1)).toMatchObject({
            i: 'm1',
            isMapItem: true,
            mapName: 'Districts',
            x: 3,
        })
    })

    it('applies grid positions and sorts in reading order', () => {
        const items = [toVisualItem(visual, 0), { ...toVisualItem(visual, 1), i: 'v2' }]
        const moved = withGridLayout(items, [{ i: 'v1', x: 6, y: 3, w: 4, h: 2 }])
        expect(moved[0]).toMatchObject({ x: 6, y: 3, w: 4, h: 2 })
        expect(inReadingOrder(moved).map((i) => i.i)).toEqual(['v2', 'v1'])
    })

    it('builds the saved dashboard, keeping sharing and the creator', () => {
        const saved = buildDashboard(
            { ...initialDashboardEditor, name: '  Weekly  ', visuals: [toVisualItem(visual, 0)] },
            {
                dashboardName: 'old',
                createdBy: { id: 'a', name: 'A' },
                updatedBy: { id: 'a', name: 'A' },
                createdAt: 1,
                updatedAt: 1,
                selectedVisuals: [],
                sharing: [{ id: 'g', type: 'Group' }],
                favorites: ['a'],
            },
            { id: 'b', name: 'B' },
            5,
            undefined
        )
        expect(saved).toMatchObject({
            dashboardName: 'Weekly',
            createdBy: { id: 'a' },
            updatedBy: { id: 'b' },
            createdAt: 1,
            updatedAt: 5,
            favorites: ['a'],
            sharing: [{ id: 'g' }],
        })
    })
})

describe('dashboardEditorSlice', () => {
    it('adds each item once and removes by id', () => {
        let state = reducer(undefined, actions.addVisual(toVisualItem(visual, 0)))
        state = reducer(state, actions.addVisual(toVisualItem(visual, 0)))
        state = reducer(state, actions.addMap(toMapItem(map, 1)))
        expect(state.visuals).toHaveLength(1)
        state = reducer(state, actions.removeItem('m1'))
        expect(state.maps).toHaveLength(0)
    })
})

describe('DHIS2 favorites on dashboards', () => {
    const summary = {
        id: 'pt1',
        name: 'ANC table',
        objectType: 'visualization' as const,
        subtype: 'PIVOT_TABLE',
    }

    it('links a favorite per data source, loads and saves it', () => {
        const here = toDhis2Item(summary, '1', 0)
        const there = toDhis2Item(summary, 'ext', 1)
        expect(here).toMatchObject({ i: '1_visualization_pt1', kind: 'dhis2', objectId: 'pt1' })
        expect(there.i).toBe('ext_visualization_pt1')

        let state = reducer(initialDashboardEditor, actions.addDhis2Item(here))
        state = reducer(state, actions.addDhis2Item(here))
        state = reducer(state, actions.addDhis2Item(there))
        expect(state.dhis2Items.map((item) => item.i)).toEqual([here.i, there.i])

        state = reducer(state, actions.applyGridLayout([{ i: here.i, x: 6, y: 0, w: 6, h: 4 }]))
        expect(state.dhis2Items[0]).toMatchObject({ x: 6, w: 6, h: 4 })

        const saved = buildDashboard(state, undefined, { id: 'u', name: 'U' }, 1, undefined)
        expect(saved.selectedDhis2Items).toHaveLength(2)
        expect(reducer(state, actions.loadDashboard(saved)).dhis2Items).toHaveLength(2)

        state = reducer(state, actions.removeItem(there.i))
        expect(state.dhis2Items).toHaveLength(1)
    })

    it('loads older dashboards without DHIS2 items', () => {
        const saved = buildDashboard(
            initialDashboardEditor,
            undefined,
            { id: 'u', name: 'U' },
            1,
            undefined
        )
        delete saved.selectedDhis2Items
        expect(reducer(initialDashboardEditor, actions.loadDashboard(saved)).dhis2Items).toEqual([])
    })
})
