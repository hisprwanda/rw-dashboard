import i18n from '@dhis2/d2-i18n'
import { StatusPage } from '@/shared/components'

/** Route: /unauthorized (where RequireAuthority sends users without access). */
export default function UnauthorizedPage() {
    return (
        <StatusPage
            code="401"
            title={i18n.t('Unauthorized')}
            message={i18n.t(
                'You are not allowed to access this resource. Please contact the administrator for assistance.'
            )}
        />
    )
}
