import React from 'react'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import MainLayout from './components/layout/MainLayout'
import {
    NotFoundPage,
    AdminPage,
    UnauthorizedPage,
    UserPage,
    HomePage,
    VisualizersPage,
    VisualizationPage,
    AlertsPage,
    SettingsPage,
    DashboardsPage,
    DataSourcePage,
    ReportPage,
} from './pages'
import { CreateDashboardPage } from './pages/dashboards'
import { Toaster } from './components/ui/toaster'
import MapHomepage from './pages/Map/MapHomepage'
import AllMapsPage from './pages/Map/AllMapsPage'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
})

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<HomePage />} />
                            <Route path="dashboards" element={<DashboardsPage />} />
                            <Route path="visualization" element={<VisualizationPage />} />
                            <Route path="maps" element={<AllMapsPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                            <Route path="alerts" element={<AlertsPage />} />
                            <Route path="datasource" element={<DataSourcePage />} />
                            <Route path="unauthorized" element={<UnauthorizedPage />} />
                            <Route path="map/:id?/:mapName?" element={<MapHomepage />} />
                            <Route path="visualizers/:id?" element={<VisualizersPage />} />
                            <Route
                                path="dashboard/:id?/:present?"
                                element={<CreateDashboardPage />}
                            />
                            <Route path="report" element={<ReportPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Route>

                        <Route
                            path="admin"
                            element={
                                <ProtectedRoute requiredAuthorities={['F_SYSTEM_SETTING']}>
                                    <AdminPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="user"
                            element={
                                <ProtectedRoute requiredAuthorities={['M_dhis-web-dashboard']}>
                                    <UserPage />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Router>
                <Toaster />
            </AuthProvider>
        </QueryClientProvider>
    )
}

export default App
