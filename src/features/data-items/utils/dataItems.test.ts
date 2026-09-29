import type { DataItemsFilters } from '../types/dataItem.types'
import { dataItemGroupsRequest, dataItemsRequest } from './dataItemsRequest'
import { toPickerOptions, uniqueOptions } from './pickerOptions'

const base: DataItemsFilters = {
    type: 'dataItems',
    search: '',
    groupId: '',
    disaggregation: 'totals',
    metric: '',
}

describe('dataItemsRequest', () => {
    it('pages every request and applies the search', () => {
        const request = dataItemsRequest({ ...base, search: 'anc' }, 3)
        expect(request.resource).toBe('dataItems')
        expect(request.params).toMatchObject({
            page: 3,
            pageSize: 50,
            paging: true,
            filter: ['displayName:ilike:anc'],
        })
    })

    it('combines search and group for indicators', () => {
        expect(
            dataItemsRequest({ ...base, type: 'indicators', search: 'x', groupId: 'g1' }, 1).params
                .filter
        ).toEqual(['displayName:ilike:x', 'indicatorGroups.id:eq:g1'])
    })

    it('limits data elements to aggregate ones, or lists operands for details', () => {
        expect(dataItemsRequest({ ...base, type: 'dataElements' }, 1).params.filter).toContain(
            'domainType:eq:AGGREGATE'
        )
        expect(
            dataItemsRequest({ ...base, type: 'dataElements', disaggregation: 'details' }, 1)
                .listKey
        ).toBe('dataElementOperands')
    })

    it('narrows program items by dimension item type and program', () => {
        expect(
            dataItemsRequest({ ...base, type: 'Program Indicator', groupId: 'p1' }, 1).params.filter
        ).toEqual(['dimensionItemType:eq:PROGRAM_INDICATOR', 'programId:eq:p1'])
    })
})

describe('dataItemGroupsRequest', () => {
    it('returns the group resource per type, or none', () => {
        expect(dataItemGroupsRequest('indicators')?.resource).toBe('indicatorGroups')
        expect(dataItemGroupsRequest('Event Data Item')?.resource).toBe('programs')
        expect(dataItemGroupsRequest('dataSets')).toBeNull()
    })
})

describe('toPickerOptions', () => {
    const items = [{ id: 'ds1', name: 'ANC' }]

    it('expands data sets into metric options, optionally filtered', () => {
        expect(toPickerOptions(items, { ...base, type: 'dataSets' })).toHaveLength(4)
        expect(
            toPickerOptions(items, { ...base, type: 'dataSets', metric: 'REPORTING_RATE' })
        ).toEqual([{ label: 'ANC - Reporting rate', value: 'ds1.REPORTING_RATE' }])
    })

    it('maps other items one to one and removes duplicates', () => {
        expect(toPickerOptions(items, base)).toEqual([{ label: 'ANC', value: 'ds1' }])
        expect(
            uniqueOptions([
                { label: 'a', value: '1' },
                { label: 'b', value: '1' },
            ])
        ).toHaveLength(1)
    })
})
