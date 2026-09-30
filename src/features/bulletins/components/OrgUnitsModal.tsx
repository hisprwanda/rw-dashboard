import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import { useEffect } from 'react'
import { useAppDispatch, useAppStore } from '@/app/store'
import { OrgUnitPicker, orgUnitSelectionActions } from '@/features/org-units'
import type { InstanceConnection } from '@/shared/api'
import type { BulletinOrgUnits } from '../types/bulletin.types'
import { fromOrgUnitSelection, toOrgUnitSelection } from '../utils/orgUnits'

interface OrgUnitsModalProps {
    instance: InstanceConnection
    value: BulletinOrgUnits
    onChange: (value: BulletinOrgUnits) => void
    onClose: () => void
}

/** The shared org-unit picker, loaded with and written back to the template's org units. */
export const OrgUnitsModal = ({ instance, value, onChange, onClose }: OrgUnitsModalProps) => {
    const dispatch = useAppDispatch()
    const store = useAppStore()
    useEffect(() => {
        dispatch(orgUnitSelectionActions.setOrgUnitSelection(toOrgUnitSelection(value)))
        // Loaded once when the modal opens.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <Modal large onClose={onClose} position="middle">
            <ModalTitle>{i18n.t('Organisation units')}</ModalTitle>
            <ModalContent>
                <OrgUnitPicker instance={instance} />
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        primary
                        onClick={() => {
                            onChange(fromOrgUnitSelection(store.getState().orgUnitSelection))
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
