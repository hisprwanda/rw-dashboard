import type { InstanceClient } from '@/shared/api'
import { fetchDimensionItems, fetchDimensions } from './dimensionsService'

const clientReturning = (response: unknown) => {
    const get = jest.fn().mockResolvedValue(response)
    return { client: { get, getBlob: jest.fn() } as unknown as InstanceClient, get }
}

describe('fetchDimensions', () => {
    it('lists the dynamic dimensions only', async () => {
        const { client, get } = clientReturning({
            dimensions: [
                { id: 'dx', displayName: 'Data' },
                { id: 'pe', displayName: 'Period' },
                { id: 'ou', displayName: 'Organisation unit' },
                { id: 'J5jldMd8OHv', displayName: 'Facility Type' },
            ],
        })
        expect(await fetchDimensions(client)).toEqual([
            { id: 'J5jldMd8OHv', displayName: 'Facility Type' },
        ])
        expect(get).toHaveBeenCalledWith(
            'dimensions',
            { fields: 'id,displayName', paging: false },
            undefined
        )
    })
})

describe('fetchDimensionItems', () => {
    it('reads the items of one dimension', async () => {
        const { client, get } = clientReturning({ items: [{ id: 'i1', displayName: 'Clinic' }] })
        expect(await fetchDimensionItems(client, 'J5jldMd8OHv')).toEqual([
            { id: 'i1', displayName: 'Clinic' },
        ])
        expect(get).toHaveBeenCalledWith(
            'dimensions/J5jldMd8OHv/items',
            { fields: 'id,displayName', paging: false },
            undefined
        )
    })
})
