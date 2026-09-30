import i18n from '@dhis2/d2-i18n'
import { Card, IconDataString24, IconFileDocument24 } from '@dhis2/ui'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { PageHeader } from '@/shared/components'

interface SettingsLink {
    to: string
    title: string
    description: string
    icon: ReactNode
}

const settingsLinks = (): SettingsLink[] => [
    {
        to: paths.dataSources,
        title: i18n.t('Data sources'),
        description: i18n.t(
            'Configure where your data comes from. By default, data is read from this DHIS2 instance.'
        ),
        icon: <IconDataString24 />,
    },
    {
        to: paths.bulletins,
        title: i18n.t('Bulletins'),
        description: i18n.t(
            'Design bulletins (sections, data, texts, logos) and publish them period by period.'
        ),
        icon: <IconFileDocument24 />,
    },
]

/** Entry points to the app's configuration pages. */
export const SettingsOverview = () => (
    <div className="mx-auto w-full max-w-5xl">
        <PageHeader title={i18n.t('Settings')} />
        <div className="grid grid-cols-1 gap-4 px-6 md:grid-cols-2">
            {settingsLinks().map((link) => (
                <Link key={link.to} to={link.to} className="text-inherit no-underline">
                    <Card>
                        <div className="flex items-start gap-4 p-6">
                            <span className="text-blue-700">{link.icon}</span>
                            <div>
                                <h2 className="m-0 text-lg font-semibold text-blue-900">
                                    {link.title}
                                </h2>
                                <p className="mb-0 mt-1 text-gray-600">{link.description}</p>
                            </div>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    </div>
)
