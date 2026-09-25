import i18n from '@dhis2/d2-i18n'
import { Button, NoticeBox } from '@dhis2/ui'

interface ErrorStateProps {
    title?: string
    error?: unknown
    onRetry?: () => void
}

const messageOf = (error: unknown): string | undefined => {
    if (!error) return undefined
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    return undefined
}

/** Standard rendering of a failed query. */
export const ErrorState = ({ title, error, onRetry }: ErrorStateProps) => (
    <div className="p-4">
        <NoticeBox error title={title ?? i18n.t('Something went wrong')}>
            <p>{messageOf(error) ?? i18n.t('The data could not be loaded.')}</p>
            {onRetry && (
                <div className="mt-2">
                    <Button small onClick={onRetry}>
                        {i18n.t('Try again')}
                    </Button>
                </div>
            )}
        </NoticeBox>
    </div>
)
