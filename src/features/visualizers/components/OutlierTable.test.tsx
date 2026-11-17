import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/shared/testing'
import { OutlierTable } from './OutlierTable'

const header = (name: string, column: string, valueType = 'TEXT') => ({
    name,
    column,
    valueType,
    type: 'java.lang.String',
    hidden: false,
    meta: false,
})

describe('OutlierTable', () => {
    it('shows names and formatted numbers, not raw ids', () => {
        renderWithProviders(
            <OutlierTable
                data={{
                    headers: [
                        header('dx', 'Data'),
                        header('dxname', 'Data name'),
                        header('value', 'Value', 'NUMBER'),
                    ],
                    rows: [['abc', 'ANC 1st visit', '1234.5678']],
                }}
            />
        )
        expect(screen.getByText('Data name')).toBeTruthy()
        expect(screen.getByText('ANC 1st visit')).toBeTruthy()
        expect(screen.queryByText('abc')).toBeNull()
        expect(screen.getByText(/1.?234[.,]57/)).toBeTruthy()
    })

    it('says when there are no outliers', () => {
        renderWithProviders(<OutlierTable data={{ headers: [], rows: [] }} />)
        expect(screen.getByText('No outliers found')).toBeTruthy()
    })
})
