import i18n from '@dhis2/d2-i18n'
import { Button, Checkbox, CircularLoader, IconChevronDown16, IconChevronRight16 } from '@dhis2/ui'
import { useState } from 'react'
import type { InstanceConnection } from '@/shared/api'
import type { IdentifiableObject } from '@/shared/types/dhis2.types'
import { useOrgUnitChildren } from '../hooks/useOrgUnitChildren'

interface NodeProps {
    instance: InstanceConnection
    unit: IdentifiableObject & { path?: string }
    selectedIds: readonly string[]
    disabled: boolean
    onToggle: (unit: { id: string; path?: string }) => void
}

const ExternalOrgUnitNode = ({ instance, unit, selectedIds, disabled, onToggle }: NodeProps) => {
    const [expanded, setExpanded] = useState(false)
    const children = useOrgUnitChildren(instance, unit.id, expanded)
    const hasNoChildren = children.isSuccess && children.data.length === 0

    return (
        <li>
            <div className="flex items-center gap-1">
                <Button
                    small
                    secondary
                    disabled={hasNoChildren}
                    icon={expanded ? <IconChevronDown16 /> : <IconChevronRight16 />}
                    aria-label={expanded ? i18n.t('Collapse') : i18n.t('Expand')}
                    onClick={() => setExpanded((open) => !open)}
                />
                <Checkbox
                    dense
                    label={unit.displayName ?? unit.name ?? unit.id}
                    checked={selectedIds.includes(unit.id)}
                    disabled={disabled}
                    onChange={() => onToggle({ id: unit.id, path: unit.path })}
                />
            </div>
            {expanded && (
                <ul className="ml-6 list-none border-l border-gray-200 pl-2">
                    {children.isLoading && <CircularLoader extrasmall />}
                    {children.error && (
                        <li className="text-sm text-red-600">
                            {i18n.t('Could not load the sub-units.')}
                        </li>
                    )}
                    {children.data?.map((child) => (
                        <ExternalOrgUnitNode
                            key={child.id}
                            instance={instance}
                            unit={child}
                            selectedIds={selectedIds}
                            disabled={disabled}
                            onToggle={onToggle}
                        />
                    ))}
                </ul>
            )}
        </li>
    )
}

interface ExternalOrgUnitTreeProps extends Omit<NodeProps, 'unit'> {
    roots: IdentifiableObject[]
}

/**
 * Org-unit tree for an external instance (the `@dhis2/ui` tree can only read the
 * current one). Children are fetched per expanded node and cached by TanStack Query.
 */
export const ExternalOrgUnitTree = ({ roots, ...props }: ExternalOrgUnitTreeProps) => (
    <ul className="list-none p-0">
        {roots.map((root) => (
            <ExternalOrgUnitNode key={root.id} unit={root} {...props} />
        ))}
    </ul>
)
