import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    MultiSelectField,
    MultiSelectOption,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { visualizerActions } from '../store/visualizerSlice'
import { RELATIVE_YEARS, YEAR_OVER_YEAR_CATEGORIES } from '../utils/yearOverYear'

interface YearOverYearPeriodModalProps {
    onClose: () => void
    /** Runs the analytics with the new selection; the modal closes when it resolves. */
    onUpdate: () => Promise<void> | void
    updating?: boolean
}

const relativeYearLabel = (id: string) => {
    const labels: Record<string, string> = {
        THIS_YEAR: i18n.t('This year'),
        LAST_YEAR: i18n.t('Last year'),
        LAST_5_YEARS: i18n.t('Last 5 years'),
        LAST_10_YEARS: i18n.t('Last 10 years'),
    }
    return labels[id] ?? id
}

const categoryLabel = (id: string) => {
    const labels: Record<string, string> = {
        DAYS_THIS_YEAR: i18n.t('Days per year'),
        WEEKS_THIS_YEAR: i18n.t('Weeks per year'),
        MONTHS_THIS_YEAR: i18n.t('Months per year'),
        BIMONTHS_THIS_YEAR: i18n.t('Bi-months per year'),
        QUARTERS_THIS_YEAR: i18n.t('Quarters per year'),
        SIXMONTHS_THIS_YEAR: i18n.t('Six-months per year'),
    }
    return labels[id] ?? id
}

/** The fixed years offered besides the relative ones: this year and the 20 before it. */
const fixedYears = () => {
    const current = new Date().getFullYear()
    return Array.from({ length: 21 }, (_, index) => String(current - index))
}

/** The periods of the year-over-year charts: the years compared and the periods within a year. */
export const YearOverYearPeriodModal = ({
    onClose,
    onUpdate,
    updating = false,
}: YearOverYearPeriodModalProps) => {
    const dispatch = useAppDispatch()
    const selection = useAppSelector((state) => state.visualizer.yearOverYear)
    const update = (patch: Partial<typeof selection>) =>
        dispatch(visualizerActions.setYearOverYear({ ...selection, ...patch }))

    return (
        <Modal onClose={onClose} position="middle">
            <ModalTitle>{i18n.t('Period')}</ModalTitle>
            <ModalContent>
                <div className="flex flex-col gap-4">
                    <MultiSelectField
                        label={i18n.t('Years to compare (series)')}
                        helpText={i18n.t('Each year is drawn as its own line or set of columns.')}
                        selected={selection.years}
                        filterable
                        noMatchText={i18n.t('No match found')}
                        onChange={({ selected }) => update({ years: selected })}
                    >
                        {[...RELATIVE_YEARS, ...fixedYears()].map((year) => (
                            <MultiSelectOption
                                key={year}
                                value={year}
                                label={relativeYearLabel(year)}
                            />
                        ))}
                    </MultiSelectField>
                    <SingleSelectField
                        label={i18n.t('Periods within a year (category)')}
                        selected={selection.category}
                        onChange={({ selected }) => update({ category: selected })}
                    >
                        {YEAR_OVER_YEAR_CATEGORIES.map((category) => (
                            <SingleSelectOption
                                key={category}
                                value={category}
                                label={categoryLabel(category)}
                            />
                        ))}
                    </SingleSelectField>
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose}>
                        {i18n.t('Hide')}
                    </Button>
                    <Button
                        primary
                        loading={updating}
                        disabled={selection.years.length === 0}
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
