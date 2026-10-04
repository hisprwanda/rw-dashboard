import { fireEvent, render, screen } from '@testing-library/react'
import type { DashboardDhis2Item } from '../types/dashboard.types'
import type { DashboardItem } from './DashboardItemContent'
import { DashboardPresentation } from './DashboardPresentation'

jest.mock('@/features/presentation-music', () => ({
    useMusicTracks: () => ({ data: [] }),
}))

const mockMounts: string[] = []
const mockUseEffect = jest.requireActual<typeof import('react')>('react').useEffect

jest.mock('./DashboardItemContent', () => ({
    itemTitle: (item: { name: string }) => item.name,
    DashboardItemContent: ({ item }: { item: DashboardItem }) => {
        mockUseEffect(() => {
            mockMounts.push(item.i)
        }, [item.i])
        return null
    },
}))

const item = (i: string): DashboardDhis2Item => ({
    i,
    x: 0,
    y: 0,
    w: 3,
    h: 3,
    kind: 'dhis2',
    objectType: 'visualization',
    objectId: i,
    name: `Item ${i}`,
    subtype: 'COLUMN',
    dataSourceId: 'current',
})

it('loads each slide once, the next one ahead, and keeps them when going back', () => {
    mockMounts.length = 0
    render(
        <DashboardPresentation
            name="Weekly"
            items={['a', 'b', 'c'].map(item)}
            onExit={() => undefined}
        />
    )
    expect(mockMounts).toEqual(['a', 'b'])

    const next = screen.getByRole('button', { name: 'Next slide' })
    fireEvent.click(next)
    fireEvent.click(next)
    fireEvent.click(next)
    expect(mockMounts).toEqual(['a', 'b', 'c'])
    expect(screen.getByText('Slide 1 of 3')).toBeTruthy()
})
