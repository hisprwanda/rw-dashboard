import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { queryClient } from '@/shared/api'

/**
 * Every app-wide provider, in one place. The DHIS2 app shell already provides the
 * data engine, config, alerts and CSS; this adds the app's own providers.
 * (Redux joins here in Phase 3 with the first feature slice.)
 */
export const AppProviders = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
)
