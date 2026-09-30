import i18n from '@dhis2/d2-i18n'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import type { ReactNode } from 'react'

interface SectionFrameProps {
    title: string
    description?: string
    children: ReactNode
}

/** A bulletin chapter: banner title, optional description, content. */
export const SectionFrame = ({ title, description, children }: SectionFrameProps) => (
    <section className="bulletin-section mb-6 break-inside-avoid-page">
        {title && (
            <h2 className="mb-4 mt-0 bg-blue-400 px-3 py-3 text-center text-xl font-bold">
                {title}
            </h2>
        )}
        {description && <p className="whitespace-pre-line">{description}</p>}
        {children}
    </section>
)

/** Loading, error and "not configured" states shared by the data sections. */
export const SectionStatus = ({
    loading,
    error,
    configured = true,
}: {
    loading?: boolean
    error?: unknown
    configured?: boolean
}) => {
    if (!configured) {
        return (
            <NoticeBox warning title={i18n.t('Section not configured')}>
                {i18n.t('Edit the bulletin to choose the data this section uses.')}
            </NoticeBox>
        )
    }
    if (loading) {
        return (
            <div className="flex justify-center p-4">
                <CircularLoader small />
            </div>
        )
    }
    if (error) {
        return (
            <NoticeBox error title={i18n.t('This section could not be loaded')}>
                {error instanceof Error ? error.message : String(error)}
            </NoticeBox>
        )
    }
    return null
}

export const ItemList = ({ items, empty }: { items: readonly string[]; empty: string }) =>
    items.length ? (
        <ul className="list-disc pl-6">
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    ) : (
        <p className="text-gray-600">{empty}</p>
    )
