import i18n from '@dhis2/d2-i18n'
import {
    Button,
    Checkbox,
    MultiSelectField,
    MultiSelectOption,
    OrganisationUnitTree,
} from '@dhis2/ui'
import { useAppDispatch, useAppSelector } from '@/app/store'
import type { InstanceConnection } from '@/shared/api'
import { ErrorState, LoadingState } from '@/shared/components'
import { useOrgUnitMetadata } from '../hooks/useOrgUnitMetadata'
import { orgUnitSelectionActions as actions } from '../store/orgUnitSelectionSlice'
import type { UserOrgUnitScope } from '../types/orgUnit.types'
import { ExternalOrgUnitTree } from './ExternalOrgUnitTree'

// Labels are translated at render time (the locale is not known at import time).
const userScopes = (): Array<{ key: keyof UserOrgUnitScope; label: string }> => [
    { key: 'is_USER_ORGUNIT', label: i18n.t('User org unit') },
    { key: 'is_USER_ORGUNIT_CHILDREN', label: i18n.t('User sub-units') },
    { key: 'is_USER_ORGUNIT_GRANDCHILDREN', label: i18n.t('User sub-x2-units') },
]

interface OrgUnitPickerProps {
    instance: InstanceConnection
    /** Maps use level numbers (`LEVEL-2`), charts use level ids. */
    levelValue?: 'id' | 'level'
}

/**
 * Picks the org-unit dimension (Redux `orgUnitSelection`): the user's org units, or
 * units from the tree plus levels and groups. Works on the current and external instances.
 */
export const OrgUnitPicker = ({ instance, levelValue = 'id' }: OrgUnitPickerProps) => {
    const dispatch = useAppDispatch()
    const selection = useAppSelector((state) => state.orgUnitSelection)
    const { data, isLoading, error, refetch } = useOrgUnitMetadata(instance)

    if (isLoading) return <LoadingState />
    if (error || !data) return <ErrorState error={error} onRetry={() => void refetch()} />

    const roots = data.currentUser.organisationUnits
    const levels = data.orgUnitLevels.organisationUnitLevels
    const groups = data.orgUnitGroups.organisationUnitGroups
    const disabled = selection.useCurrentUserOrgUnits
    const toggle = (unit: { id: string; path?: string }) => dispatch(actions.toggleOrgUnit(unit))

    const onLevelsChange = ({ selected }: { selected: string[] }) => {
        const picked = levels.filter((level) => selected.includes(String(level.level)))
        dispatch(
            actions.setLevels({
                levels: picked.map((level) => level.level),
                levelIds: picked.map((level) => (levelValue === 'level' ? level.level : level.id)),
            })
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4 rounded border border-gray-200 bg-gray-50 p-2">
                {userScopes().map(({ key, label }) => (
                    <Checkbox
                        key={key}
                        label={label}
                        checked={selection.userOrgUnitScope[key]}
                        onChange={({ checked }) =>
                            dispatch(actions.toggleUserOrgUnitScope({ key, checked }))
                        }
                    />
                ))}
            </div>

            <div className="max-h-[360px] overflow-y-auto rounded border border-gray-200 p-2">
                {instance.isCurrentInstance ? (
                    <OrganisationUnitTree
                        roots={roots.map((root) => root.id)}
                        selected={selection.selectedTreePaths}
                        disableSelection={disabled}
                        onChange={({ id, path }) => toggle({ id, path })}
                    />
                ) : (
                    <ExternalOrgUnitTree
                        instance={instance}
                        roots={roots}
                        selectedIds={selection.selectedOrgUnitIds}
                        disabled={disabled}
                        onToggle={toggle}
                    />
                )}
            </div>

            <div className="flex gap-2">
                <div className="flex-1">
                    <MultiSelectField
                        label={i18n.t('Levels')}
                        placeholder={i18n.t('Select levels')}
                        disabled={disabled}
                        selected={(selection.selectedLevels ?? []).map(String)}
                        onChange={onLevelsChange}
                    >
                        {levels.map((level) => (
                            <MultiSelectOption
                                key={level.id}
                                value={String(level.level)}
                                label={level.displayName ?? level.name ?? String(level.level)}
                            />
                        ))}
                    </MultiSelectField>
                </div>
                <div className="flex-1">
                    <MultiSelectField
                        label={i18n.t('Groups')}
                        placeholder={i18n.t('Select groups')}
                        disabled={disabled}
                        selected={selection.selectedGroupIds}
                        onChange={({ selected }: { selected: string[] }) =>
                            dispatch(actions.setSelectedGroupIds(selected))
                        }
                    >
                        {groups.map((group) => (
                            <MultiSelectOption
                                key={group.id}
                                value={group.id}
                                label={group.displayName ?? group.name ?? group.id}
                            />
                        ))}
                    </MultiSelectField>
                </div>
            </div>

            <div>
                <Button
                    small
                    secondary
                    disabled={disabled}
                    onClick={() => dispatch(actions.clearExplicitSelection())}
                >
                    {i18n.t('Deselect all')}
                </Button>
            </div>
        </div>
    )
}
