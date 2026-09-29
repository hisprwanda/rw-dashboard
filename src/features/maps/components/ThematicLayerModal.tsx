import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    Tab,
    TabBar,
} from '@dhis2/ui'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { selectionActions } from '@/features/analytics'
import { DataItemsPicker } from '@/features/data-items'
import { DataSourceSelect } from '@/features/data-sources'
import { OrgUnitPicker, orgUnitSelectionActions } from '@/features/org-units'
import { PeriodPicker } from '@/features/periods'
import { StyleOptions } from './StyleOptions'

type LayerTab = 'data' | 'period' | 'orgUnits' | 'style'

interface ThematicLayerModalProps {
    isEditing: boolean
    onClose: () => void
    /** Runs the layer with the new selection; the modal closes when it resolves. */
    onApply: () => Promise<void> | void
    applying?: boolean
}

/** Data, period, org units and style of the thematic layer. */
export const ThematicLayerModal = ({
    isEditing,
    onClose,
    onApply,
    applying = false,
}: ThematicLayerModalProps) => {
    const dispatch = useAppDispatch()
    const [tab, setTab] = useState<LayerTab>('data')
    const dataSourceId = useAppSelector((state) => state.selection.dataSourceId)
    const dataSource = useAppSelector((state) => state.selection.dataSource)
    const tabs: Array<{ id: LayerTab; label: string }> = [
        { id: 'data', label: i18n.t('Data') },
        { id: 'period', label: i18n.t('Period') },
        { id: 'orgUnits', label: i18n.t('Org units') },
        { id: 'style', label: i18n.t('Style') },
    ]

    return (
        <Modal large onClose={onClose} position="middle">
            <ModalTitle>
                {isEditing ? i18n.t('Edit thematic layer') : i18n.t('Add thematic layer')}
            </ModalTitle>
            <ModalContent>
                <TabBar>
                    {tabs.map(({ id, label }) => (
                        <Tab key={id} selected={tab === id} onClick={() => setTab(id)}>
                            {label}
                        </Tab>
                    ))}
                </TabBar>
                <div className="min-h-[360px] pt-4">
                    {tab === 'data' && (
                        <div className="flex flex-col gap-3">
                            <div className="max-w-sm">
                                <DataSourceSelect
                                    value={dataSourceId}
                                    onChange={(id, next) => {
                                        dispatch(
                                            selectionActions.changeDataSource({
                                                id,
                                                dataSource: next,
                                            })
                                        )
                                        dispatch(orgUnitSelectionActions.resetOrgUnitSelection())
                                    }}
                                />
                            </div>
                            <DataItemsPicker />
                        </div>
                    )}
                    {tab === 'period' && <PeriodPicker />}
                    {tab === 'orgUnits' && (
                        <OrgUnitPicker instance={dataSource} levelValue="level" />
                    )}
                    {tab === 'style' && <StyleOptions />}
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        primary
                        loading={applying}
                        onClick={async () => {
                            await onApply()
                            onClose()
                        }}
                    >
                        {isEditing ? i18n.t('Update layer') : i18n.t('Add layer')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
