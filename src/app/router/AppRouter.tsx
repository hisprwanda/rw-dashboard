import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/app/layout/MainLayout'
import { LoadingState } from '@/shared/components'

// Pages are code-split: each route downloads its code on first visit.
// Every route renders a thin page from src/pages, which renders one feature component.
const HomePage = lazy(() => import('@/pages/home/HomePage'))
const DashboardsPage = lazy(() => import('@/pages/dashboards/DashboardsPage'))
const DashboardEditorPage = lazy(() => import('@/pages/dashboards/[id]/DashboardEditorPage'))
const DashboardPresentPage = lazy(() => import('@/pages/dashboards/[id]/DashboardPresentPage'))
const VisualizationsPage = lazy(() => import('@/pages/visualizers/VisualizationsPage'))
const VisualizerBuilderPage = lazy(() => import('@/pages/visualizers/[id]/VisualizerBuilderPage'))
const MapsPage = lazy(() => import('@/pages/maps/MapsPage'))
const MapBuilderPage = lazy(() => import('@/pages/maps/[id]/MapBuilderPage'))
const ReportPage = lazy(() => import('@/pages/report/ReportPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const DataSourcesPage = lazy(() => import('@/pages/settings/data-sources/DataSourcesPage'))
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

/** Route pages take no props: everything comes from the URL. */
type Page = LazyExoticComponent<ComponentType>

const page = (Component: Page) => (
    <Suspense fallback={<LoadingState />}>
        <Component />
    </Suspense>
)

export const AppRouter = () => (
    <HashRouter>
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={page(HomePage)} />
                <Route path="dashboards" element={page(DashboardsPage)} />
                <Route path="dashboard/:id?" element={page(DashboardEditorPage)} />
                <Route path="dashboard/:id/present" element={page(DashboardPresentPage)} />
                <Route path="visualization" element={page(VisualizationsPage)} />
                <Route path="visualizers/:id?" element={page(VisualizerBuilderPage)} />
                <Route path="maps" element={page(MapsPage)} />
                <Route path="map/:id?/:mapName?" element={page(MapBuilderPage)} />
                <Route path="report" element={page(ReportPage)} />
                <Route path="settings" element={page(SettingsPage)} />
                <Route path="datasource" element={page(DataSourcesPage)} />
                <Route path="unauthorized" element={page(UnauthorizedPage)} />
                <Route path="*" element={page(NotFoundPage)} />
            </Route>
        </Routes>
    </HashRouter>
)
