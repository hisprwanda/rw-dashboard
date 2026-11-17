import type { DashboardVisualItem } from '../types/dashboard.types'
import { visualItemQueries } from './visualQueries'

const item = {
    i: 'v1',
    x: 0,
    y: 0,
    w: 3,
    h: 3,
    visualName: 'ANC',
    visualType: 'Column',
    visualQuery: {
        myData: {
            resource: 'analytics',
            params: { dimension: ['dx:a;b', 'pe:2024'], filter: 'ou:ou1' },
        },
    },
    analyticsPayloadDeterminer: {
        Columns: ['Data'],
        Rows: ['Period'],
        Filter: ['Organisation unit'],
    },
    dataSourceId: '1',
    additionalSources: [{ dataSourceId: 'ext', dataItems: [{ id: 'b', label: 'B' }] }],
} as DashboardVisualItem

const current = { isCurrentInstance: true, instanceName: 'Here' }
const external = { isCurrentInstance: false, instanceName: 'Ext', url: 'u', token: 't' }

describe('visualItemQueries', () => {
    it('reads each data item from its own data source', () => {
        const result = visualItemQueries(item, (id) => (id === 'ext' ? external : current))
        expect(result?.missing).toBe(false)
        expect(result?.dataOrder).toEqual(['a', 'b'])
        expect(result?.queries).toEqual([
            {
                instance: { isCurrentInstance: true },
                instanceName: 'Here',
                dataParams: {
                    dimension: ['dx:a', 'pe:2024'],
                    filter: 'ou:ou1',
                    includeMetadataDetails: true,
                },
            },
            {
                instance: { isCurrentInstance: false, url: 'u', token: 't' },
                instanceName: 'Ext',
                dataParams: {
                    dimension: ['dx:b', 'pe:2024'],
                    filter: 'ou:ou1',
                    includeMetadataDetails: true,
                },
            },
        ])
    })

    it('flags a missing data source', () => {
        const result = visualItemQueries(item, (id) => (id === 'ext' ? undefined : current))
        expect(result?.missing).toBe(true)
        expect(result?.queries).toHaveLength(1)
    })
})
