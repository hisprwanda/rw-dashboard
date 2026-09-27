import i18n from '@dhis2/d2-i18n'
import { Button, Modal, ModalActions, ModalContent, ModalTitle, Tag } from '@dhis2/ui'
import type { DataSource } from '../types/dataSource.types'

interface DataSourceDetailsProps {
    dataSource: DataSource
    onClose: () => void
}

/** Read-only view. The token is never displayed. */
export const DataSourceDetails = ({ dataSource, onClose }: DataSourceDetailsProps) => (
    <Modal onClose={onClose} position="middle" small>
        <ModalTitle>{dataSource.instanceName}</ModalTitle>
        <ModalContent>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-3 text-sm">
                <dt className="font-medium text-gray-600">{i18n.t('Type')}</dt>
                <dd>
                    {dataSource.type}{' '}
                    {dataSource.isCurrentInstance && (
                        <Tag positive>{i18n.t('Current instance')}</Tag>
                    )}
                </dd>
                <dt className="font-medium text-gray-600">{i18n.t('URL')}</dt>
                <dd className="break-all">{dataSource.url}</dd>
                <dt className="font-medium text-gray-600">{i18n.t('Description')}</dt>
                <dd>{dataSource.description || i18n.t('No description provided')}</dd>
            </dl>
        </ModalContent>
        <ModalActions>
            <Button onClick={onClose}>{i18n.t('Close')}</Button>
        </ModalActions>
    </Modal>
)
