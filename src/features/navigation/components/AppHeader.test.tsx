import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/shared/testing'
import { isInGlobalShell } from '../utils/links'
import { AppHeader } from './AppHeader'

jest.mock('../utils/links', () => ({
    ...jest.requireActual<typeof import('../utils/links')>('../utils/links'),
    isInGlobalShell: jest.fn(),
}))

const inShell = jest.mocked(isInGlobalShell)

it('shows the DHIS2 controls when the app is on its own', () => {
    inShell.mockReturnValue(false)
    renderWithProviders(<AppHeader />)
    expect(screen.getByRole('link', { name: 'DHIS2 home' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Dashboards' })).toBeTruthy()
})

it('shows only the app navigation inside the Global Shell', () => {
    inShell.mockReturnValue(true)
    renderWithProviders(<AppHeader />)
    expect(screen.getByRole('link', { name: 'Dashboards' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Bulletins' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'DHIS2 home' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Messages' })).toBeNull()
})
