import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { LoadingState } from '@/shared/components'
import { useHasAuthority } from '../hooks/useHasAuthority'
import { useMe } from '../hooks/useMe'

interface RequireAuthorityProps {
    authorities: readonly string[]
    children: ReactNode
    /** Where to send users without access. */
    redirectTo?: string
}

/** Route guard: renders its children only for users with all the given authorities. */
export const RequireAuthority = ({
    authorities,
    children,
    redirectTo = '/unauthorized',
}: RequireAuthorityProps) => {
    const { isLoading } = useMe()
    const allowed = useHasAuthority(authorities)

    if (isLoading) return <LoadingState />
    return allowed ? <>{children}</> : <Navigate to={redirectTo} replace />
}
