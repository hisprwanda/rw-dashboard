import type { ReactNode } from 'react'

interface PageHeaderProps {
    title: string
    description?: string
    /** Buttons or other controls rendered on the right. */
    actions?: ReactNode
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
    <header className="flex flex-wrap items-start justify-between gap-4 px-6 py-4">
        <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
)
