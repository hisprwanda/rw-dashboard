import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    Transfer,
    type TransferOption,
} from '@dhis2/ui'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { selectionActions, useDimensionItems, useDimensions } from '@/features/analytics'
import { ErrorState, LoadingState } from '@/shared/components'

interface DynamicDimensionModalProps {
    dimensionId: string
    onClose: () => void
    /** Runs the analytics with the new selection; the modal closes when it resolves. */
    onUpdate: () => Promise<void> | void
    updating?: boolean
}

/** Picks the items of a dynamic dimension (a category, a group set…). */
export const DynamicDimensionModal = ({
    dimensionId,
    onClose,
    onUpdate,
    updating = false,
}: DynamicDimensionModalProps) => {
    const dispatch = useAppDispatch()
    const dataSource = useAppSelector((state) => state.selection.dataSource)
    const selected = useAppSelector((state) => state.selection.dimensions[dimensionId] ?? [])
    const dimensions = useDimensions(dataSource)
    const items = useDimensionItems(dataSource, dimensionId)
    const title = dimensions.data?.find(({ id }) => id === dimensionId)?.displayName

    const options: TransferOption[] = (items.data ?? []).map((item) => ({
        label: item.displayName,
        value: item.id,
    }))

    return (
        <Modal large onClose={onClose} position="middle">
            <ModalTitle>{title ?? i18n.t('Dimension')}</ModalTitle>
            <ModalContent>
                {items.isLoading && <LoadingState />}
                {items.error && <ErrorState error={items.error} />}
                {items.data && (
                    <Transfer
                        filterable
                        options={options}
                        selected={selected}
                        onChange={({ selected: next }) =>
                            dispatch(
                                selectionActions.setDimensionItems({
                                    dimension: dimensionId,
                                    items: next,
                                })
                            )
                        }
                        leftHeader={
                            <span className="p-2 text-sm">{i18n.t('Available items')}</span>
                        }
                        rightHeader={
                            <span className="p-2 text-sm">{i18n.t('Selected items')}</span>
                        }
                        height="400px"
                    />
                )}
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
