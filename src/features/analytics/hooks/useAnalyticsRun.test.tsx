import { act, waitFor } from '@testing-library/react'
import { renderHookWithProviders } from '@/shared/testing'
import { buildAnalyticsRequest } from '../utils/buildAnalyticsRequest'
import { useAnalyticsRun } from './useAnalyticsRun'

const response = {
    headers: [
        { name: 'dx', column: 'Data', valueType: 'TEXT', type: 'x', hidden: false, meta: true },
        { name: 'pe', column: 'Period', valueType: 'TEXT', type: 'x', hidden: false, meta: true },
        {
            name: 'value',
            column: 'Value',
            valueType: 'NUMBER',
            type: 'x',
            hidden: false,
            meta: false,
        },
    ],
    rows: [['a', '2024', '5']],
    metaData: { items: { a: { name: 'ANC' } }, dimensions: { dx: ['a'], pe: ['2024'] } },
    width: 3,
    height: 1,
}

const request = buildAnalyticsRequest({
    dimension: ['dx:a', 'pe:2024'],
    orgUnit: {
        useCurrentUserOrgUnits: true,
        userOrgUnitScope: {
            is_USER_ORGUNIT: true,
            is_USER_ORGUNIT_CHILDREN: false,
            is_USER_ORGUNIT_GRANDCHILDREN: false,
        },
        orgUnitIds: [],
        levelIds: [],
        groupIds: [],
    },
})

describe('useAnalyticsRun', () => {
    it('stays idle until run, then loads the data and the metadata', async () => {
        let calls = 0
        const { result } = renderHookWithProviders(() => useAnalyticsRun(), {
            data: {
                analytics: () => {
                    calls += 1
                    return response
                },
            },
        })
        expect(result.current.data).toBeUndefined()
        expect(calls).toBe(0)

        if (!request) throw new Error('request expected')
        await act(() => result.current.run(request, { isCurrentInstance: true }))
        await waitFor(() => expect(result.current.data?.rows).toEqual([['a', '2024', '5']]))
        expect(result.current.metaData?.items.a?.name).toBe('ANC')
        expect(result.current.request).toBe(request)
        expect(calls).toBe(2)

        // Running the same request again always fetches fresh data.
        await act(() => result.current.run(request, { isCurrentInstance: true }))
        await waitFor(() => expect(calls).toBe(4))
    })

    it('exposes server errors', async () => {
        const { result } = renderHookWithProviders(() => useAnalyticsRun(), {
            data: {
                analytics: () => {
                    throw new Error('Dimension item not found')
                },
            },
        })
        if (!request) throw new Error('request expected')
        await act(() => result.current.run(request, { isCurrentInstance: true }))
        await waitFor(() => expect(result.current.error?.message).toMatch(/not found/))
    })
})
