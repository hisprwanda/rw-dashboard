import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    CircularLoader,
    IconUser24,
    IconUserGroup24,
    InputField,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import { useState } from 'react'
import { ErrorState, LoadingState } from '@/shared/components'
import type { SharingEntry } from '@/shared/types/common.types'
import { useDashboard } from '../hooks/useDashboard'
import { useSharingSearch } from '../hooks/useSharingSearch'
import { useUpdateDashboard } from '../hooks/useUpdateDashboard'
import type { AccessLevel, GeneralAccess, SharingCandidate } from '../types/dashboard.types'

const REMOVE = 'remove'

const accessLabels = (): Record<GeneralAccess, string> => ({
    'No access': i18n.t('No access'),
    'View only': i18n.t('View only'),
    'View and edit': i18n.t('View and edit'),
})

interface SharingModalProps {
    dashboardKey: string
    dashboardName: string
    onClose: () => void
}

/** Who can see a dashboard: everyone (general access) and specific users or groups. */
export const SharingModal = ({ dashboardKey, dashboardName, onClose }: SharingModalProps) => {
    const dashboard = useDashboard(dashboardKey)
    const update = useUpdateDashboard()
    const [search, setSearch] = useState('')
    const [picked, setPicked] = useState<SharingCandidate | null>(null)
    const [access, setAccess] = useState<AccessLevel>('View only')
    const results = useSharingSearch(picked ? '' : search)
    const labels = accessLabels()

    const save = (change: (sharing: SharingEntry[]) => SharingEntry[]) =>
        update.mutate({
            key: dashboardKey,
            update: (current) => ({ ...current, sharing: change(current.sharing ?? []) }),
            successMessage: i18n.t('Sharing settings saved'),
        })

    const sharing = dashboard.data?.sharing ?? []
    const alreadyShared = !!picked && sharing.some((share) => share.id === picked.id)

    const giveAccess = () => {
        if (!picked) return
        save((current) => [
            ...current.filter((share) => share.id !== picked.id),
            { id: picked.id, name: picked.name, type: picked.type, accessLevel: access },
        ])
        setPicked(null)
        setSearch('')
    }

    return (
        <Modal onClose={onClose} position="middle">
            <ModalTitle>
                {i18n.t('Sharing settings for {{name}}', { name: dashboardName })}
            </ModalTitle>
            <ModalContent>
                {dashboard.isLoading && <LoadingState />}
                {dashboard.error && <ErrorState error={dashboard.error} />}
                {dashboard.data && (
                    <div className="flex flex-col gap-5">
                        <section>
                            <h4 className="mb-2 mt-0 text-sm font-semibold">
                                {i18n.t('Give access to a user or group')}
                            </h4>
                            <div className="flex items-end gap-2">
                                <div className="relative flex-1">
                                    <InputField
                                        dense
                                        label={i18n.t('User or group')}
                                        placeholder={i18n.t('Search users or groups')}
                                        value={picked ? picked.name : search}
                                        onChange={({ value }) => {
                                            setPicked(null)
                                            setSearch(value ?? '')
                                        }}
                                    />
                                    {!picked && search.trim() && (
                                        <ul className="absolute z-10 m-0 max-h-48 w-full list-none overflow-auto rounded border border-gray-300 bg-white p-0 shadow">
                                            {results.isFetching && (
                                                <li className="p-2">
                                                    <CircularLoader extrasmall />
                                                </li>
                                            )}
                                            {results.data?.map((candidate) => (
                                                <li key={candidate.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPicked(candidate)}
                                                        className="flex w-full items-center justify-between gap-2 border-0 bg-white p-2 text-left hover:bg-gray-100"
                                                    >
                                                        {candidate.name}
                                                        <span className="text-xs text-gray-500">
                                                            {candidate.type === 'User'
                                                                ? i18n.t('User')
                                                                : i18n.t('Group')}
                                                        </span>
                                                    </button>
                                                </li>
                                            ))}
                                            {results.isSuccess && !results.data.length && (
                                                <li className="p-2 text-sm text-gray-500">
                                                    {i18n.t('No match')}
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                                <div className="w-40">
                                    <SingleSelectField
                                        dense
                                        label={i18n.t('Access')}
                                        selected={access}
                                        onChange={({ selected }) =>
                                            setAccess(selected as AccessLevel)
                                        }
                                    >
                                        <SingleSelectOption
                                            value="View only"
                                            label={labels['View only']}
                                        />
                                        <SingleSelectOption
                                            value="View and edit"
                                            label={labels['View and edit']}
                                        />
                                    </SingleSelectField>
                                </div>
                                <Button
                                    primary
                                    disabled={!picked || alreadyShared}
                                    loading={update.isPending}
                                    onClick={giveAccess}
                                >
                                    {i18n.t('Give access')}
                                </Button>
                            </div>
                            {alreadyShared && (
                                <p className="m-0 mt-1 text-xs text-gray-500">
                                    {i18n.t('Already has access; change it below.')}
                                </p>
                            )}
                        </section>

                        <section>
                            <h4 className="mb-2 mt-0 text-sm font-semibold">
                                {i18n.t('Users and groups with access')}
                            </h4>
                            <div className="flex items-center justify-between gap-2 border-b border-gray-200 py-2">
                                <span className="flex items-center gap-2">
                                    <IconUserGroup24 />
                                    <span>
                                        <strong>{i18n.t('All users')}</strong>
                                        <span className="block text-xs text-gray-500">
                                            {i18n.t('Anyone logged in')}
                                        </span>
                                    </span>
                                </span>
                                <div className="w-40">
                                    <SingleSelectField
                                        dense
                                        selected={
                                            dashboard.data.generalDashboardAccess ?? 'No access'
                                        }
                                        onChange={({ selected }) =>
                                            update.mutate({
                                                key: dashboardKey,
                                                update: (current) => ({
                                                    ...current,
                                                    generalDashboardAccess: selected,
                                                }),
                                                successMessage: i18n.t('Sharing settings saved'),
                                            })
                                        }
                                    >
                                        {(Object.keys(labels) as GeneralAccess[]).map((key) => (
                                            <SingleSelectOption
                                                key={key}
                                                value={key}
                                                label={labels[key]}
                                            />
                                        ))}
                                    </SingleSelectField>
                                </div>
                            </div>
                            <ul className="m-0 max-h-56 list-none overflow-auto p-0">
                                {sharing.map((share) => (
                                    <li
                                        key={share.id}
                                        className="flex items-center justify-between gap-2 border-b border-gray-100 py-2"
                                    >
                                        <span className="flex items-center gap-2">
                                            {share.type === 'Group' ? (
                                                <IconUserGroup24 />
                                            ) : (
                                                <IconUser24 />
                                            )}
                                            {share.name ?? share.id}
                                        </span>
                                        <div className="w-40">
                                            <SingleSelectField
                                                dense
                                                selected={
                                                    share.accessLevel === 'View and edit' ||
                                                    share.accessLevel === 'View and Edit'
                                                        ? 'View and edit'
                                                        : 'View only'
                                                }
                                                onChange={({ selected }) =>
                                                    save((current) =>
                                                        selected === REMOVE
                                                            ? current.filter(
                                                                  (s) => s.id !== share.id
                                                              )
                                                            : current.map((s) =>
                                                                  s.id === share.id
                                                                      ? {
                                                                            ...s,
                                                                            accessLevel: selected,
                                                                        }
                                                                      : s
                                                              )
                                                    )
                                                }
                                            >
                                                <SingleSelectOption
                                                    value="View only"
                                                    label={labels['View only']}
                                                />
                                                <SingleSelectOption
                                                    value="View and edit"
                                                    label={labels['View and edit']}
                                                />
                                                <SingleSelectOption
                                                    value={REMOVE}
                                                    label={i18n.t('Remove access')}
                                                />
                                            </SingleSelectField>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onClose}>{i18n.t('Close')}</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
