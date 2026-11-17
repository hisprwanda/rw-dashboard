import { initialOrgUnitSelection } from '@/features/org-units'
import { initialSelection } from '../store/selectionSlice'
import { buildSelectionRequest, buildSelectionRuns, multiSourceIssues } from './selectionRequest'

describe('buildSelectionRequest', () => {
    it('is null until data items are picked', () => {
        expect(buildSelectionRequest(initialSelection, initialOrgUnitSelection)).toBeNull()
    })

    it('builds the request from the selection and the org units', () => {
        const request = buildSelectionRequest(
            { ...initialSelection, dimensions: { dx: ['abc'], pe: ['LAST_12_MONTHS'] } },
            {
                ...initialOrgUnitSelection,
                useCurrentUserOrgUnits: false,
                selectedOrgUnitIds: ['ou1'],
                selectedLevelIds: ['lvl'],
            }
        )
        expect(request?.storedQuery.myData.params).toMatchObject({
            dimension: ['dx:abc', 'pe:LAST_12_MONTHS'],
            filter: 'ou:ou1;LEVEL-lvl',
        })
    })
})

const external = { isCurrentInstance: false, instanceName: 'eIDSR', url: 'https://x', token: 't' }
const orgUnits = {
    ...initialOrgUnitSelection,
    useCurrentUserOrgUnits: false,
    selectedOrgUnitIds: ['ou1'],
}
const multiSource = {
    ...initialSelection,
    dimensions: { dx: ['a'], pe: ['2024'] },
    additionalSources: [
        {
            dataSourceId: 'ext',
            dataSource: external,
            items: [
                { id: 'b', label: 'B' },
                { id: 'a', label: 'A' },
            ],
        },
    ],
}

describe('buildSelectionRuns', () => {
    it('combines every data item and splits them per data source', () => {
        const runs = buildSelectionRuns(multiSource, orgUnits)
        expect(runs?.dataOrder).toEqual(['a', 'b'])
        expect(runs?.request.storedQuery.myData.params.dimension).toEqual(['dx:a;b', 'pe:2024'])
        expect(runs?.parts.map(({ instance }) => instance.instanceName)).toEqual([
            initialSelection.dataSource.instanceName,
            'eIDSR',
        ])
        // An item already read from the main source is not read again.
        expect(runs?.parts[1]?.request.storedQuery.myData.params).toMatchObject({
            dimension: ['dx:b', 'pe:2024'],
            filter: 'ou:ou1',
        })
    })

    it('skips sources without data items', () => {
        const runs = buildSelectionRuns(
            { ...multiSource, dimensions: { dx: [], pe: ['2024'] } },
            orgUnits
        )
        expect(runs?.parts.map(({ instance }) => instance.instanceName)).toEqual(['eIDSR'])
    })

    it('is null while the selection is incomplete', () => {
        expect(
            buildSelectionRuns({ ...multiSource, dimensions: { dx: ['a'], pe: [] } }, orgUnits)
        ).toBeNull()
    })
})

describe('multiSourceIssues', () => {
    it('has none without additional data items', () => {
        expect(
            multiSourceIssues({ ...initialSelection, dimensions: { dx: [], co: ['x'] } })
        ).toEqual([])
    })

    it('needs data on columns or rows and no dynamic dimensions', () => {
        expect(
            multiSourceIssues({
                ...multiSource,
                dimensions: { ...multiSource.dimensions, co: ['x'] },
                layout: { Columns: ['Period'], Rows: [], Filter: ['Data'] },
            })
        ).toEqual(['dataInFilter', 'dynamicDimensions'])
    })
})
