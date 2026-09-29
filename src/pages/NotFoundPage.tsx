import i18n from '@dhis2/d2-i18n'
import { StatusPage } from '@/shared/components'

/** Any unknown route. */
export default function NotFoundPage() {
    return (
        <StatusPage
            code="404"
            title={i18n.t('Page not found')}
            message={i18n.t('Sorry, we couldn’t find the page you’re looking for.')}
        />
    )
}
