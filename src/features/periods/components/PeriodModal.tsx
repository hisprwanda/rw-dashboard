import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import { useAppSelector } from '@/app/store'
import { PeriodPicker } from './PeriodPicker'

interface PeriodModalProps {
    onClose: () => void
    /** Runs the analytics with the new periods; the modal closes when it resolves. */
    onUpdate: () => Promise<void> | void
    updating?: boolean
    bulletinMode?: boolean
}

export const PeriodModal = ({
    onClose,
    onUpdate,
    updating = false,
    bulletinMode = false,
}: PeriodModalProps) => {
    const hasPeriods = useAppSelector((state) => (state.selection.dimensions.pe ?? []).length > 0)
    return (
        <Modal large onClose={onClose} position="middle">
            <ModalTitle>{i18n.t('Period')}</ModalTitle>
            <ModalContent>
                <PeriodPicker bulletinMode={bulletinMode} />
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose}>
                        {i18n.t('Hide')}
                    </Button>
                    <Button
                        primary
                        loading={updating}
                        disabled={!hasPeriods}
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
