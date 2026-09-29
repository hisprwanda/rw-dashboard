import { initialOrgUnitSelection } from '@/features/org-units'
import { initialSelection } from '@/features/analytics'
import type { SavedMap } from '../types/map.types'
import { buildMapRequest } from './mapRequest'
import { mapToBuilderState, normalizeMapSettings } from './mapState'

const dataSource = { isCurrentInstance: true, instanceName: 'Here' }

describe('buildMapRequest', () => {
    it('puts org units in the dimension and periods on the filter', () => {
        const request = buildMapRequest(
            { dimensions: { dx: ['a'], pe: ['LAST_12_MONTHS'] } },
            {
                ...initialOrgUnitSelection,
                useCurrentUserOrgUnits: false,
                selectedOrgUnitIds: ['root'],
                selectedLevelIds: [2],
            }
        )
        expect(request?.geoFeatures).toEqual({ ou: 'ou:root;LEVEL-2', displayProperty: 'NAME' })
        expect(request?.analytics.storedQuery.myData.params).toMatchObject({
            dimension: ['dx:a', 'ou:root;LEVEL-2'],
            filter: 'pe:LAST_12_MONTHS',
        })
    })

    it('is null without data items or org units', () => {
        expect(buildMapRequest(initialSelection, initialOrgUnitSelection)).toBeNull()
        expect(
            buildMapRequest(
                { dimensions: { dx: ['a'], pe: ['2024'] } },
                { ...initialOrgUnitSelection, useCurrentUserOrgUnits: false }
            )
        ).toBeNull()
    })
})

describe('mapToBuilderState', () => {
    const saved = {
        id: 'm',
        mapName: 'Map',
        mapType: 'Thematic',
        dataSourceId: '1',
        queries: {
            mapAnalyticsQueryOne: {
                myData: {
                    resource: 'analytics',
                    params: { dimension: ['dx:a', 'ou:root;LEVEL-2'], filter: 'pe:LAST_12_MONTHS' },
                },
            },
            mapAnalyticsQueryTwo: { myData: { resource: 'analytics', params: {} } },
            geoFeaturesQuery: {
                result: { resource: 'geoFeatures', params: { ou: 'ou:root;LEVEL-2' } },
            },
        },
        selectedOrgUnitLevel: [2],
        BasemapType: 'osm-detailed',
        mapSettings: {
            appliedLabels: ['area', 'bogus'],
            selectedLabels: [],
            legend: {},
            legendType: 'auto',
        },
        createdBy: { id: 'u', name: 'U' },
        updatedBy: { id: 'u', name: 'U' },
        createdAt: 1,
        updatedAt: 1,
    } as unknown as SavedMap

    it('restores the data, period and org units', () => {
        const state = mapToBuilderState(saved, dataSource)
        expect(state.selection.dimensions).toEqual({ dx: ['a'], pe: ['LAST_12_MONTHS'] })
        expect(state.orgUnits).toMatchObject({
            useCurrentUserOrgUnits: false,
            selectedOrgUnitIds: ['root'],
            selectedLevelIds: ['2'],
            selectedLevels: [2],
        })
    })

    it('restores the appearance, dropping unknown labels', () => {
        const state = mapToBuilderState(saved, dataSource)
        expect(state.mapBuilder.basemap).toBe('osm-detailed')
        expect(state.mapBuilder.settings.appliedLabels).toEqual(['area'])
    })
})

describe('normalizeMapSettings', () => {
    it('defaults missing settings', () => {
        expect(normalizeMapSettings(undefined)).toEqual({
            appliedLabels: [],
            selectedLabels: [],
            legend: {},
            legendType: 'auto',
        })
    })
})
