import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import { isNotFound } from '@/shared/api'
import { ErrorState } from '@/shared/components'

/** Error of a favorite: a gentle notice when it was deleted or is not shared. */
export const Dhis2ObjectError = ({ error }: { error: unknown }) =>
    isNotFound(error) ? (
        <div className="p-2">
            <NoticeBox warning title={i18n.t('Not available')}>
                {i18n.t('This item was deleted in DHIS2 or is not shared with you.')}
            </NoticeBox>
        </div>
    ) : (
        <ErrorState title={i18n.t('Could not load this item')} error={error} />
    )
