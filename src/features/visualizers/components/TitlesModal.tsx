import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    InputField,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    Radio,
} from '@dhis2/ui'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { visualizerActions } from '../store/visualizerSlice'

interface TitlesModalProps {
    onClose: () => void
}

/**
 * Chart title (none or custom) and subtitle (automatic, i.e. the filter items, or
 * custom). Edits are applied on "Apply".
 */
export const TitlesModal = ({ onClose }: TitlesModalProps) => {
    const dispatch = useAppDispatch()
    const titles = useAppSelector((state) => state.visualizer.titles)
    const [title, setTitle] = useState(titles.visualTitle ?? '')
    const [hasTitle, setHasTitle] = useState(!!titles.visualTitle)
    const [subtitle, setSubtitle] = useState(titles.customSubTitle ?? '')
    const [hasCustomSubtitle, setHasCustomSubtitle] = useState(!!titles.customSubTitle)

    const apply = () => {
        dispatch(
            visualizerActions.setTitles({
                ...titles,
                visualTitle: hasTitle ? title.trim() : '',
                customSubTitle: hasCustomSubtitle ? subtitle.trim() : '',
            })
        )
        onClose()
    }

    return (
        <Modal small onClose={onClose} position="middle">
            <ModalTitle>{i18n.t('Titles')}</ModalTitle>
            <ModalContent>
                <div className="flex flex-col gap-4">
                    <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
                        <legend className="mb-1 text-sm font-medium">
                            {i18n.t('Chart title')}
                        </legend>
                        <Radio
                            dense
                            label={i18n.t('None')}
                            checked={!hasTitle}
                            onChange={() => setHasTitle(false)}
                        />
                        <Radio
                            dense
                            label={i18n.t('Custom')}
                            checked={hasTitle}
                            onChange={() => setHasTitle(true)}
                        />
                        {hasTitle && (
                            <InputField
                                dense
                                placeholder={i18n.t('Chart title')}
                                value={title}
                                onChange={({ value }) => setTitle(value ?? '')}
                            />
                        )}
                    </fieldset>
                    <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
                        <legend className="mb-1 text-sm font-medium">
                            {i18n.t('Chart subtitle')}
                        </legend>
                        <Radio
                            dense
                            label={i18n.t('Automatic (filter items)')}
                            checked={!hasCustomSubtitle}
                            onChange={() => setHasCustomSubtitle(false)}
                        />
                        <Radio
                            dense
                            label={i18n.t('Custom')}
                            checked={hasCustomSubtitle}
                            onChange={() => setHasCustomSubtitle(true)}
                        />
                        {hasCustomSubtitle && (
                            <InputField
                                dense
                                placeholder={i18n.t('Chart subtitle')}
                                value={subtitle}
                                onChange={({ value }) => setSubtitle(value ?? '')}
                            />
                        )}
                    </fieldset>
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button primary onClick={apply}>
                        {i18n.t('Apply')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
