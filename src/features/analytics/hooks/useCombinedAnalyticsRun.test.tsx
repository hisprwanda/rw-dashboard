import { act, waitFor } from '@testing-library/react'
import { initialOrgUnitSelection } from '@/features/org-units'
import { renderHookWithProviders } from '@/shared/testing'
import { initialSelection } from '../store/selectionSlice'
import { buildSelectionRuns } from '../utils/selectionRequest'
import { useCombinedAnalyticsRun } from './useCombinedAnalyticsRun'

const header = (name: string) => ({
    name,
    column: name,
    valueType: 'TEXT',
    type: 'x',
    hidden: false,
    meta: name !== 'value',
})

const runs = buildSelectionRuns(
    {
        ...initialSelection,
        dimensions: { dx: ['a'], pe: ['2024'] },
        additionalSources: [
            {
                dataSourceId: 'other',
                // The test engine only serves the current instance.
                dataSource: { isCurrentInstance: true, instanceName: 'Other' },
                items: [{ id: 'b', label: 'B' }],
            },
        ],
    },
    initialOrgUnitSelection
)

describe('useCombinedAnalyticsRun', () => {
    it('merges the analytics of every data source', async () => {
        const { result } = renderHookWithProviders(() => useCombinedAnalyticsRun(), {
            data: {
                analytics: (_type: unknown, query: { params?: { dimension?: string[] } }) => {
                    const dx = query.params?.dimension?.[0]?.slice(3) ?? ''
                    return {
                        headers: ['dx', 'pe', 'value'].map(header),
                        rows: [[dx, '2024', dx === 'a' ? '1' : '2']],
                        metaData: { items: { [dx]: { name: dx } }, dimensions: { dx: [dx] } },
                        width: 3,
                        height: 1,
                    }
                },
            },
        })
        if (!runs) throw new Error('runs expected')
        await act(() => result.current.run(runs))
        await waitFor(() =>
            expect(result.current.data?.rows).toEqual([
                ['a', '2024', '1'],
                ['b', '2024', '2'],
            ])
        )
        expect(result.current.metaData?.dimensions.dx).toEqual(['a', 'b'])
        expect(result.current.request).toBe(runs.request)
    })
})
