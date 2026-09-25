import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { RequireAuthority } from '@/features/auth'
import { LoadingState } from '@/shared/components'

// Pages are code-split: each route downloads its code on first visit.
// Legacy page components are loaded from src/pages/** until their feature is migrated.
const HomePage = lazy(() => import('@/pages/home/HomePage'))
const DashboardsPage = lazy(() => import('@/pages/dashboards/DashboardsPage'))
const CreateDashboardPage = lazy(() => import('@/pages/dashboards/CreateDashboardPage'))
const VisualizationPage = lazy(() => import('@/pages/visualizers/VisualizationPage'))
const VisualizersPage = lazy(() => import('@/pages/visualizers/VisualizersPage'))
const AllMapsPage = lazy(() => import('@/pages/Map/AllMapsPage'))
const MapHomepage = lazy(() => import('@/pages/Map/MapHomepage'))
const ReportPage = lazy(() => import('@/pages/report/ReportPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const DataSourcePage = lazy(() => import('@/pages/settings/DataSource/DataSourcePage'))
const AlertsPage = lazy(() => import('@/pages/alerts/AlertsPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const UserPage = lazy(() => import('@/pages/UserPage'))
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
                <Route path="dashboard/:id?/:present?" element={page(CreateDashboardPage)} />
                <Route path="visualization" element={page(VisualizationPage)} />
                <Route path="visualizers/:id?" element={page(VisualizersPage)} />
                <Route path="maps" element={page(AllMapsPage)} />
                <Route path="map/:id?/:mapName?" element={page(MapHomepage)} />
                <Route path="report" element={page(ReportPage)} />
                <Route path="settings" element={page(SettingsPage)} />
                <Route path="datasource" element={page(DataSourcePage)} />
                <Route path="alerts" element={page(AlertsPage)} />
                <Route path="unauthorized" element={page(UnauthorizedPage)} />
                <Route path="*" element={page(NotFoundPage)} />
            </Route>

            <Route
                path="admin"
                element={
                    <RequireAuthority authorities={['F_SYSTEM_SETTING']}>
                        {page(AdminPage)}
                    </RequireAuthority>
                }
            />
            <Route
                path="user"
                element={
                    <RequireAuthority authorities={['M_dhis-web-dashboard']}>
                        {page(UserPage)}
                    </RequireAuthority>
                }
            />
        </Routes>
    </HashRouter>
)
