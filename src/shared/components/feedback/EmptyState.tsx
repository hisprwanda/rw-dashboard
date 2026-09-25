import type { ReactNode } from 'react'

interface EmptyStateProps {
    message: string
    action?: ReactNode
}

export const EmptyState = ({ message, action }: EmptyStateProps) => (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-600">
        <p>{message}</p>
        {action}
    </div>
)
