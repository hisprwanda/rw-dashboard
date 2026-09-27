import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    InputField,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    SingleSelectField,
    SingleSelectOption,
    TextAreaField,
} from '@dhis2/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useSaveDataSource } from '../hooks/useSaveDataSource'
import { dataSourceSchema, type DataSourceFormValues } from '../schemas/dataSourceSchema'
import type { DataSourceEntry } from '../types/dataSource.types'

const EMPTY: DataSourceFormValues = {
    instanceName: '',
    description: '',
    url: '',
    token: '',
    type: 'DHIS2',
    isCurrentInstance: false,
}

interface DataSourceFormProps {
    /** The entry to edit; omitted to create a new data source. */
    entry?: DataSourceEntry
    onClose: () => void
}

export const DataSourceForm = ({ entry, onClose }: DataSourceFormProps) => {
    const save = useSaveDataSource()
    const { control, handleSubmit } = useForm<DataSourceFormValues>({
        defaultValues: entry ? { ...EMPTY, ...entry.value } : EMPTY,
        resolver: zodResolver(dataSourceSchema),
    })

    const onSubmit = handleSubmit(async (value) => {
        await save.mutateAsync({ key: entry?.key, value })
        onClose()
    })

    return (
        <Modal onClose={onClose} position="middle">
            <ModalTitle>
                {entry ? i18n.t('Edit data source') : i18n.t('New data source')}
            </ModalTitle>
            <ModalContent>
                <form id="data-source-form" onSubmit={onSubmit} className="flex flex-col gap-4">
                    <Controller
                        name="instanceName"
                        control={control}
                        render={({ field, fieldState }) => (
                            <InputField
                                name={field.name}
                                label={i18n.t('Instance name')}
                                required
                                value={field.value}
                                onChange={({ value }) => field.onChange(value ?? '')}
                                onBlur={field.onBlur}
                                error={!!fieldState.error}
                                validationText={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="url"
                        control={control}
                        render={({ field, fieldState }) => (
                            <InputField
                                name={field.name}
                                label={i18n.t('URL')}
                                required
                                type="url"
                                placeholder="https://play.im.dhis2.org/stable-2-43-1"
                                value={field.value}
                                onChange={({ value }) => field.onChange(value ?? '')}
                                onBlur={field.onBlur}
                                error={!!fieldState.error}
                                validationText={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="token"
                        control={control}
                        render={({ field, fieldState }) => (
                            <InputField
                                name={field.name}
                                label={i18n.t('Personal access token')}
                                required
                                type="password"
                                value={field.value}
                                onChange={({ value }) => field.onChange(value ?? '')}
                                onBlur={field.onBlur}
                                error={!!fieldState.error}
                                validationText={fieldState.error?.message}
                                helpText={i18n.t(
                                    'Created in the remote instance under Profile > Personal access tokens.'
                                )}
                            />
                        )}
                    />
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <SingleSelectField
                                label={i18n.t('Type')}
                                selected={field.value}
                                onChange={({ selected }) => field.onChange(selected)}
                            >
                                <SingleSelectOption label="DHIS2" value="DHIS2" />
                            </SingleSelectField>
                        )}
                    />
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <TextAreaField
                                name={field.name}
                                label={i18n.t('Description')}
                                value={field.value ?? ''}
                                onChange={({ value }) => field.onChange(value ?? '')}
                                onBlur={field.onBlur}
                            />
                        )}
                    />
                </form>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose} disabled={save.isPending}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button primary type="submit" form="data-source-form" loading={save.isPending}>
                        {entry ? i18n.t('Update') : i18n.t('Save')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
