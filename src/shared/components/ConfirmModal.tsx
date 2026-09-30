import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import type { ReactNode } from 'react'

interface ConfirmModalProps {
    title: string
    children: ReactNode
    confirmLabel?: string
    /** Red confirm button, for deletions. */
    destructive?: boolean
    loading?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export const ConfirmModal = ({
    title,
    children,
    confirmLabel,
    destructive = false,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) => (
    <Modal small onClose={onCancel}>
        <ModalTitle>{title}</ModalTitle>
        <ModalContent>{children}</ModalContent>
        <ModalActions>
            <ButtonStrip end>
                <Button secondary onClick={onCancel} disabled={loading}>
                    {i18n.t('Cancel')}
                </Button>
                <Button
                    primary={!destructive}
                    destructive={destructive}
                    onClick={onConfirm}
                    loading={loading}
                >
                    {confirmLabel ?? i18n.t('Confirm')}
                </Button>
            </ButtonStrip>
        </ModalActions>
    </Modal>
)
