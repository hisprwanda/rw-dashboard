import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import { useNavigate } from 'react-router-dom'

interface StatusPageProps {
    code: string
    title: string
    message: string
}

/** Full-page status (404, 401…) with a way back home. */
export const StatusPage = ({ code, title, message }: StatusPageProps) => {
    const navigate = useNavigate()
    return (
        <main className="flex min-h-[calc(100vh-48px)] items-center justify-center p-6 text-center">
            <div>
                <p className="m-0 font-semibold text-gray-500">{code}</p>
                <h1 className="mt-4 text-3xl font-bold text-gray-900">{title}</h1>
                <p className="mt-4 text-gray-600">{message}</p>
                <div className="mt-8">
                    <Button onClick={() => navigate('/')}>{i18n.t('Back to home')}</Button>
                </div>
            </div>
        </main>
    )
}
