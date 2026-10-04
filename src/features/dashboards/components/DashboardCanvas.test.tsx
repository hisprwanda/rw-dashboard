import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import type { DashboardDhis2Item } from '../types/dashboard.types'
import { DashboardCanvas } from './DashboardCanvas'

jest.mock('@/features/dhis2-objects', () => ({ Dhis2ObjectView: () => null }))
jest.mock('@/features/maps', () => ({ SavedMapView: () => null }))
jest.mock('./DashboardVisual', () => ({ DashboardVisual: () => null }))

const item = (i: string, name: string, x: number): DashboardDhis2Item => ({
    i,
    x,
    y: 0,
    w: 3,
    h: 3,
    kind: 'dhis2',
    objectType: 'visualization',
    objectId: i,
    name,
    subtype: 'PIVOT_TABLE',
    dataSourceId: 'current',
})

const Harness = () => {
    const [items, setItems] = useState([item('a', 'ANC', 0), item('b', 'Malaria', 3)])
    return (
        <DashboardCanvas
            items={items}
            backgroundColor="#fff"
            editable
            onLayoutChange={() => undefined}
            onRemove={(id) => setItems((all) => all.filter((entry) => entry.i !== id))}
        />
    )
}

/** jsdom has no layout: this covers the drag cancel, not the resize-handle overlap. */
it('removes an item when its × is clicked, without starting a drag', () => {
    render(<Harness />)
    const remove = screen.getByRole('button', { name: 'Remove ANC' })
    fireEvent.mouseDown(remove)
    fireEvent.mouseUp(remove)
    fireEvent.click(remove)
    expect(screen.queryByText('ANC')).toBeNull()
    expect(screen.getByText('Malaria')).toBeTruthy()
})
