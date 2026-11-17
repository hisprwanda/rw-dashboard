import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
} from '@dhis2/ui'
import { DataItemsPicker } from './DataItemsPicker'

interface DataItemsModalProps {
    onClose: () => void
    /** Runs the analytics with the new selection; the modal closes when it resolves. */
    onUpdate: () => Promise<void> | void
    updating?: boolean
    /** A remark on what the current chart type uses, shown above the picker. */
    notice?: string
}

export const DataItemsModal = ({
    onClose,
    onUpdate,
    updating = false,
    notice,
}: DataItemsModalProps) => (
    <Modal large onClose={onClose} position="middle">
        <ModalTitle>{i18n.t('Data')}</ModalTitle>
        <ModalContent>
            {notice && (
                <div className="mb-3">
                    <NoticeBox>{notice}</NoticeBox>
                </div>
            )}
            <DataItemsPicker />
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
