import type { ReactNode } from 'react'

interface DimensionRowProps {
    icon?: ReactNode
    label: string
    /** Number of selected items; shown as a badge when above zero. */
    count?: number
    onClick: () => void
}

/** One dimension of the left panel, as a compact row (like the Data Visualizer's list). */
export const DimensionRow = ({ icon, label, count = 0, onClick }: DimensionRowProps) => (
    <button
        type="button"
        onClick={onClick}
        title={label}
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100"
    >
        {icon && <span className="flex flex-shrink-0 text-gray-600">{icon}</span>}
        <span className="min-w-0 flex-grow truncate">{label}</span>
        {count > 0 && (
            <span className="flex-shrink-0 rounded-full bg-blue-100 px-1.5 text-xs font-semibold text-blue-800">
                {count}
            </span>
        )}
    </button>
)

/** A small heading above a group of rows. */
export const PanelHeading = ({ children }: { children: ReactNode }) => (
    <h4 className="m-0 px-2 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
        {children}
    </h4>
)
