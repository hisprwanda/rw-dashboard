import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    InputField,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import { useState, type RefObject } from 'react'
import { useNotify } from '../hooks/useNotify'
import { exportElement, type ExportFormat } from '../utils/exportElement'

const formatLabels = (): Record<ExportFormat, string> => ({
    png: i18n.t('PNG image'),
    jpeg: i18n.t('JPEG image'),
    pdf: i18n.t('PDF'),
    pptx: i18n.t('PowerPoint'),
})

interface ExportModalProps {
    /** The element to capture (e.g. the chart area). */
    targetRef: RefObject<HTMLElement>
    defaultFileName?: string
    onClose: () => void
}

/** Exports an on-screen element as PNG, JPEG, PDF or PowerPoint. */
export const ExportModal = ({ targetRef, defaultFileName = '', onClose }: ExportModalProps) => {
    const notify = useNotify()
    const [fileName, setFileName] = useState(defaultFileName)
    const [format, setFormat] = useState<ExportFormat>('png')
    const [exporting, setExporting] = useState(false)
    const labels = formatLabels()

    const onExport = async () => {
        if (!targetRef.current) return
        setExporting(true)
        try {
            await exportElement(targetRef.current, fileName.trim() || 'export', format)
            onClose()
        } catch (error) {
            notify.error(
                i18n.t('Export failed: {{message}}', {
                    message: error instanceof Error ? error.message : String(error),
                })
            )
        } finally {
            setExporting(false)
        }
    }

    return (
        <Modal small onClose={onClose} position="middle">
            <ModalTitle>{i18n.t('Export')}</ModalTitle>
            <ModalContent>
                <div className="flex flex-col gap-4">
                    <InputField
                        label={i18n.t('File name')}
                        value={fileName}
                        onChange={({ value }) => setFileName(value ?? '')}
                    />
                    <SingleSelectField
                        label={i18n.t('Format')}
                        selected={format}
                        onChange={({ selected }) => setFormat(selected as ExportFormat)}
                    >
                        {(Object.keys(labels) as ExportFormat[]).map((key) => (
                            <SingleSelectOption key={key} value={key} label={labels[key]} />
                        ))}
                    </SingleSelectField>
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose} disabled={exporting}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button primary loading={exporting} onClick={() => void onExport()}>
                        {i18n.t('Export')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
