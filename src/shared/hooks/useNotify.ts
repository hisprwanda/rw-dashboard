import { useAlert } from '@dhis2/app-runtime'
import { useMemo } from 'react'

type AlertKind = 'success' | 'critical' | 'warning' | 'info'

interface AlertProps {
    message: string
    kind: AlertKind
}

/**
 * Typed wrapper around the platform `useAlert`: shows DHIS2 AlertBars.
 *
 * @example const notify = useNotify(); notify.success(i18n.t('Dashboard saved'))
 */
export const useNotify = () => {
    const { show } = useAlert(
        ({ message }: AlertProps) => message,
        ({ kind }: AlertProps) => ({ [kind]: true })
    )

    return useMemo(
        () => ({
            success: (message: string) => show({ message, kind: 'success' }),
            error: (message: string) => show({ message, kind: 'critical' }),
            warning: (message: string) => show({ message, kind: 'warning' }),
            info: (message: string) => show({ message, kind: 'info' }),
        }),
        [show]
    )
}
