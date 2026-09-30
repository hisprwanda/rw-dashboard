import type { ReactNode } from 'react'
import { ErrorState, LoadingState } from '@/shared/components'
import { useMe } from '../hooks/useMe'

/** Renders the app once the current user is known (every page needs it). */
export const SessionGate = ({ children }: { children: ReactNode }) => {
    const { data: me, isLoading, error, refetch } = useMe()
    if (isLoading) return <LoadingState fullScreen />
    if (error || !me) return <ErrorState error={error} onRetry={() => void refetch()} />
    return <>{children}</>
}
