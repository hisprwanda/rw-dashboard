import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from '@/app/store/store'
import { queryClient } from '@/shared/api'

/**
 * Every app-wide provider, in one place. The DHIS2 app shell already provides the
 * data engine, config, alerts and CSS; this adds the app's own providers.
 */
export const AppProviders = ({ children }: { children: ReactNode }) => (
    <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        </QueryClientProvider>
    </ReduxProvider>
)
