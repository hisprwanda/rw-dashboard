import { screen } from '@testing-library/react'
import type { ComponentType } from 'react'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders, type MockData } from '@/shared/testing'
import DashboardEditorPage from './dashboards/[id]/DashboardEditorPage'
import DashboardsPage from './dashboards/DashboardsPage'
import HomePage from './home/HomePage'
import MapBuilderPage from './maps/[id]/MapBuilderPage'
import MapsPage from './maps/MapsPage'
import NotFoundPage from './NotFoundPage'
import ReportPage from './report/ReportPage'
import DataSourcesPage from './settings/data-sources/DataSourcesPage'
import SettingsPage from './settings/SettingsPage'
import UnauthorizedPage from './UnauthorizedPage'
import VisualizerBuilderPage from './visualizers/[id]/VisualizerBuilderPage'
import VisualizationsPage from './visualizers/VisualizationsPage'

const me = {
    id: 'u1',
    username: 'admin',
    name: 'John Traore',
    displayName: 'John Traore',
    authorities: ['ALL'],
    organisationUnits: [{ id: 'ou1', displayName: 'Sierra Leone', path: '/ou1', level: 1 }],
    userGroups: [],
}

const dashboard = {
    dashboardName: 'Weekly overview',
    createdBy: { id: 'u1', name: 'John Traore' },
    updatedBy: { id: 'u1', name: 'John Traore' },
    createdAt: 1,
    updatedAt: 2,
    selectedVisuals: [],
    selectedMaps: [],
    isOfficialDashboard: true,
}

const data: MockData = {
    me,
    'systemSettings/applicationTitle': { applicationTitle: 'Sierra Leone' },
    'dataStore/DASHBOARD_STORE': { entries: [{ key: 'd1', value: dashboard }] },
    'dataStore/VISUALS_STORE': {
        entries: [
            {
                key: 'v1',
                value: {
                    visualName: 'ANC coverage',
                    visualType: 'Line',
                    createdBy: { id: 'u1' },
                    updatedAt: 1,
                },
            },
        ],
    },
    'dataStore/MAPS_STORE': {
        entries: [
            {
                key: 'm1',
                value: {
                    mapName: 'Districts',
                    mapType: 'Thematic',
                    createdBy: { id: 'u1' },
                    updatedAt: 1,
                },
            },
        ],
    },
    'dataStore/DATA_SOURCES_STORE': { entries: [] },
}

/** Renders the page on its route (so `useParams` works) and waits for `text`. */
const smoke = async (Page: ComponentType, path: string, route: string, text: RegExp) => {
    renderWithProviders(
        <Routes>
            <Route path={path} element={<Page />} />
        </Routes>,
        { data, route }
    )
    expect((await screen.findAllByText(text, {}, { timeout: 4000 })).length).toBeGreaterThan(0)
}

describe('route pages render', () => {
    it('home', () => smoke(HomePage, '/', '/', /Pinned dashboards/))
    it('home lists my dashboards', () => smoke(HomePage, '/', '/', /Weekly overview/))
    it('dashboards', () => smoke(DashboardsPage, '/dashboards', '/dashboards', /New dashboard/))
    it('new dashboard', () =>
        smoke(DashboardEditorPage, '/dashboard/:id?', '/dashboard', /Add a visualization/))
    it('visualizations', () =>
        smoke(VisualizationsPage, '/visualization', '/visualization', /ANC coverage/))
    it('new visualization', () =>
        smoke(VisualizerBuilderPage, '/visualizers/:id?', '/visualizers', /Main dimensions/))
    it('maps', () => smoke(MapsPage, '/maps', '/maps', /Districts/))
    it('new map', () => smoke(MapBuilderPage, '/map/:id?/:mapName?', '/map', /Add thematic layer/))
    it('report', () => smoke(ReportPage, '/report', '/report', /choose a week/i))
    it('settings', () => smoke(SettingsPage, '/settings', '/settings', /Data sources/))
    it('data sources', () =>
        smoke(DataSourcesPage, '/datasource', '/datasource', /No data sources yet/))
    it('not found', () => smoke(NotFoundPage, '*', '/nope', /Page not found/))
    it('unauthorized', () =>
        smoke(UnauthorizedPage, '/unauthorized', '/unauthorized', /Unauthorized/))
})
