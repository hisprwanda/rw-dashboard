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
import { useSharingSearch } from '../hooks/useSharingSearch'
import type {
    AccessLevel,
    GeneralAccess,
    Shareable,
    SharingCandidate,
    SharingEntry,
} from '../types/common.types'
import { ErrorState } from './feedback/ErrorState'
import { LoadingState } from './feedback/LoadingState'

const REMOVE = 'remove'

const accessLabels = (): Record<GeneralAccess, string> => ({
    'No access': i18n.t('No access'),
    'View only': i18n.t('View only'),
    'View and edit': i18n.t('View and edit'),
})

/** The sharing part of a saved item. */
export type SharingValue = Pick<Shareable, 'sharing' | 'generalDashboardAccess'>

interface SharingModalProps {
    /** Name of the shared item, shown in the title. */
    name: string
    /** Current sharing (undefined while loading). */
    value: SharingValue | undefined
    loading?: boolean
    error?: unknown
    saving?: boolean
    /** Applies a change to the latest stored sharing and saves it. */
    onSave: (change: (current: SharingValue) => SharingValue) => void
    onClose: () => void
}

/**
 * Who can see an item (dashboard, bulletin…): everyone (general access) and specific
 * users or groups. The owner always keeps access.
 */
export const SharingModal = ({
    name,
    value,
    loading = false,
    error,
    saving = false,
    onSave,
    onClose,
}: SharingModalProps) => {
    const [search, setSearch] = useState('')
    const [picked, setPicked] = useState<SharingCandidate | null>(null)
    const [access, setAccess] = useState<AccessLevel>('View only')
    const results = useSharingSearch(picked ? '' : search)
    const labels = accessLabels()

    const save = (change: (sharing: SharingEntry[]) => SharingEntry[]) =>
        onSave((current) => ({ ...current, sharing: change(current.sharing ?? []) }))

    const sharing = value?.sharing ?? []
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
            <ModalTitle>{i18n.t('Sharing settings for {{name}}', { name })}</ModalTitle>
            <ModalContent>
                {loading && <LoadingState />}
                {!!error && <ErrorState error={error} />}
                {value && (
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
                                        onChange={({ value: text }) => {
                                            setPicked(null)
                                            setSearch(text ?? '')
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
                                    loading={saving}
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
                                        selected={value.generalDashboardAccess ?? 'No access'}
                                        onChange={({ selected }) =>
                                            onSave((current) => ({
                                                ...current,
                                                generalDashboardAccess: selected,
                                            }))
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
