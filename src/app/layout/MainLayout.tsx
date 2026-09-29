import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/features/navigation'

/** Header on top, the routed page below. */
export const MainLayout = () => (
    <div className="flex h-screen flex-col">
        <div className="sticky top-0 z-10">
            <AppHeader />
        </div>
        <div className="flex-1 overflow-auto">
            <Outlet />
        </div>
    </div>
)
