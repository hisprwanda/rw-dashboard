import { CircularLoader } from '@dhis2/ui'

interface LoadingStateProps {
    label?: string
    /** Fill the whole viewport instead of the parent container. */
    fullScreen?: boolean
}

export const LoadingState = ({ label, fullScreen = false }: LoadingStateProps) => (
    <div
        className={`flex flex-col items-center justify-center gap-2 ${fullScreen ? 'h-screen' : 'py-12'}`}
        role="status"
    >
        <CircularLoader small={!fullScreen} />
        {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
)
