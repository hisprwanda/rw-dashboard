import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import { useEffect } from 'react'
import { useAppDispatch, useAppStore } from '@/app/store'
import {
    initialSelection,
    selectionActions,
    type DataItemRef,
    type SelectedDataSource,
} from '@/features/analytics'
import { DataItemsPicker } from '@/features/data-items'

interface DataItemsModalProps {
    dataSourceId: string
    dataSource: SelectedDataSource
    value: DataItemRef[]
    onChange: (value: DataItemRef[]) => void
    onClose: () => void
}

/** The shared data item picker, on the bulletin's data source. */
export const BulletinDataItemsModal = ({
    dataSourceId,
    dataSource,
    value,
    onChange,
    onClose,
}: DataItemsModalProps) => {
    const dispatch = useAppDispatch()
    const store = useAppStore()
    useEffect(() => {
        dispatch(
            selectionActions.setSelection({
                ...initialSelection,
                dataSourceId,
                dataSource,
                dimensions: { dx: value.map((item) => item.id), pe: [] },
                selectedDataItems: value,
            })
        )
        // Loaded once when the modal opens.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <Modal large onClose={onClose} position="middle">
            <ModalTitle>{i18n.t('Data items')}</ModalTitle>
            <ModalContent>
                <DataItemsPicker />
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        primary
                        onClick={() => {
                            onChange(store.getState().selection.selectedDataItems)
                            onClose()
                        }}
                    >
                        {i18n.t('Apply')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
