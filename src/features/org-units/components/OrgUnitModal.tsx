import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import type { InstanceConnection } from '@/shared/api'
import { OrgUnitPicker } from './OrgUnitPicker'

interface OrgUnitModalProps {
    instance: InstanceConnection
    onClose: () => void
    /** Runs the analytics with the new selection; the modal closes when it resolves. */
    onUpdate: () => Promise<void> | void
    updating?: boolean
}

export const OrgUnitModal = ({
    instance,
    onClose,
    onUpdate,
    updating = false,
}: OrgUnitModalProps) => (
    <Modal large onClose={onClose} position="middle">
        <ModalTitle>{i18n.t('Organisation units')}</ModalTitle>
        <ModalContent>
            <OrgUnitPicker instance={instance} />
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
