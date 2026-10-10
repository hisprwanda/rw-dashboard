import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { initialSelection, selectionActions } from '@/features/analytics'
import { DataItemsSelector } from '@/features/data-items'

interface AdditionalSourceModalProps {
    /** The additional data source whose data items are picked. */
    dataSourceId: string
    onClose: () => void
    /** Runs the analytics with the new selection; the modal closes when it resolves. */
    onUpdate: () => Promise<void> | void
    updating?: boolean
}

/** Picks the data items read from an additional data source. */
export const AdditionalSourceModal = ({
    dataSourceId,
    onClose,
    onUpdate,
    updating = false,
}: AdditionalSourceModalProps) => {
    const dispatch = useAppDispatch()
    const source = useAppSelector((state) =>
        state.selection.additionalSources.find((entry) => entry.dataSourceId === dataSourceId)
    )
    const [itemType, setItemType] = useState(initialSelection.dimensionItemType)
    if (!source) return null

    return (
        <Modal large onClose={onClose} position="middle">
            <ModalTitle>
                {i18n.t('Data from {{source}}', {
                    source: source.dataSource.instanceName,
                    interpolation: { escapeValue: false },
                })}
            </ModalTitle>
            <ModalContent>
                <DataItemsSelector
                    instance={source.dataSource}
                    itemType={itemType}
                    onItemTypeChange={setItemType}
                    picked={source.items}
                    onChange={(items) =>
                        dispatch(selectionActions.setSourceItems({ id: dataSourceId, items }))
                    }
                />
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose}>
                        {i18n.t('Hide')}
                    </Button>
                    <Button
                        primary
                        loading={updating}
                        onClick={async () => {
                            await onUpdate()
                            onClose()
                        }}
                    >
                        {i18n.t('Update')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
