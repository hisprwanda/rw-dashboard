import { CustomDataProvider } from '@dhis2/app-runtime'
// Part of the app runtime (not re-exported): lets `useAlert` work in tests.
import { AlertsProvider } from '@dhis2/app-service-alerts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, renderHook } from '@testing-library/react'
import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { makeStore, type AppStore } from '@/app/store/store'

type CustomData = ComponentProps<typeof CustomDataProvider>['data']

/**
 * Mocked server responses, keyed by resource (`me`, `dataStore/VISUALS_STORE`…): a value,
 * or a function returning one (sync or async).
 */
export type MockData = Record<string, unknown>

interface Options {
    data?: MockData
    route?: string
    store?: AppStore
}

const makeWrapper = ({ data = {}, route = '/', store = makeStore() }: Options) => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    })
    const Wrapper = ({ children }: { children: ReactNode }) => (
        // Test boundary: fixtures are app types (not JsonValue); the provider accepts any JSON.
        <CustomDataProvider data={data as CustomData}>
            <AlertsProvider>
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
                    </QueryClientProvider>
                </Provider>
            </AlertsProvider>
        </CustomDataProvider>
    )
    return { Wrapper, store, queryClient }
}

/** Renders a component with the app's providers and a mocked DHIS2 data engine. */
export const renderWithProviders = (ui: ReactElement, options: Options = {}) => {
    const { Wrapper, store, queryClient } = makeWrapper(options)
    return { ...render(ui, { wrapper: Wrapper }), store, queryClient }
}

/** Runs a hook with the app's providers and a mocked DHIS2 data engine. */
export const renderHookWithProviders = <T,>(hook: () => T, options: Options = {}) => {
    const { Wrapper, store, queryClient } = makeWrapper(options)
    return { ...renderHook(hook, { wrapper: Wrapper }), store, queryClient }
}
