import { waitFor } from '@testing-library/react'
import { renderHookWithProviders } from '@/shared/testing'
import { useDhis2ObjectSearch, useDhis2Visualization } from './useDhis2Objects'

const current = { isCurrentInstance: true }

describe('DHIS2 favorites', () => {
    it('searches visualizations by name, one page at a time', async () => {
        const params: unknown[] = []
        const { result } = renderHookWithProviders(
            () => useDhis2ObjectSearch(current, 'visualization', 'anc', 2),
            {
                data: {
                    visualizations: (_type: string, query: { params?: unknown }) => {
                        params.push(query.params)
                        return {
                            pager: { page: 2, pageCount: 3, total: 60 },
                            visualizations: [
                                { id: 'v1', displayName: 'ANC table', type: 'PIVOT_TABLE' },
                            ],
                        }
                    },
                },
            }
        )
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual({
            items: [
                {
                    id: 'v1',
                    name: 'ANC table',
                    objectType: 'visualization',
                    subtype: 'PIVOT_TABLE',
                },
            ],
            page: 2,
            pageCount: 3,
            total: 60,
        })
        expect(params[0]).toMatchObject({ filter: 'displayName:ilike:anc', page: 2 })
    })

    it('reports a deleted or unshared favorite without retrying', async () => {
        let calls = 0
        const { result } = renderHookWithProviders(() => useDhis2Visualization(current, 'gone'), {
            data: {
                'visualizations/gone': () => {
                    calls += 1
                    throw Object.assign(new Error('Not found'), {
                        details: { httpStatusCode: 404 },
                    })
                },
            },
        })
        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(calls).toBe(1)
    })
})
