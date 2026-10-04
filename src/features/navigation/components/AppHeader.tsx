import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { IconMail24, IconMessages24, LogoIconWhite } from '@dhis2/ui'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { useApplicationTitle } from '@/features/system'
import { useNotifications } from '../hooks/useNotifications'
import { isInGlobalShell, joinUrl } from '../utils/links'
import { AppsMenu } from './AppsMenu'
import { ProfileMenu } from './ProfileMenu'

const navItems = () => [
    { label: i18n.t('Dashboards'), to: paths.dashboards },
    { label: i18n.t('Visualizers'), to: paths.visualizations },
    { label: i18n.t('Map'), to: paths.maps },
    { label: i18n.t('Settings'), to: paths.settings },
    { label: i18n.t('Bulletins'), to: paths.bulletins },
]

const IconLink = ({
    href,
    label,
    count,
    icon,
}: {
    href: string
    label: string
    count?: number
    icon: ReactNode
}) => (
    <a
        href={href}
        aria-label={count ? `${label} (${count})` : label}
        className="relative flex h-12 items-center px-3 text-white hover:bg-[#1A557F]"
    >
        {icon}
        {!!count && (
            <span className="absolute right-1 top-1 min-w-[18px] rounded-full bg-[#00a940] px-1 text-center text-[12px] font-semibold">
                {count}
            </span>
        )}
    </a>
)

/** The app's own pages, as tabs under the Global Shell's header bar. */
const ShellNavigation = () => (
    <nav
        className="flex items-center border-b border-gray-200 bg-white text-sm"
        aria-label={i18n.t('Main')}
    >
        <Link
            to={paths.home}
            className="border-r border-gray-200 px-3 py-2 font-medium text-gray-900 no-underline"
        >
            {i18n.t('Data Analytics Lab')}
        </Link>
        {navItems().map((item) => (
            <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                    `border-b-2 px-3 py-2 no-underline ${
                        isActive
                            ? 'border-[#2C6693] text-[#2C6693]'
                            : 'border-transparent text-gray-700 hover:bg-gray-100'
                    }`
                }
            >
                {item.label}
            </NavLink>
        ))}
    </nav>
)

/**
 * The app header (the platform header is hidden in styles/index.css): logo, title,
 * navigation, messages, apps and profile.
 */
const FullHeader = () => {
    const { baseUrl } = useConfig()
    const title = useApplicationTitle()
    const { data: notifications } = useNotifications()

    return (
        <nav
            className="flex items-center justify-between bg-[#2C6693] text-white"
            aria-label={i18n.t('Main')}
        >
            <div className="flex items-center">
                <a
                    href={baseUrl}
                    aria-label={i18n.t('DHIS2 home')}
                    className="mr-3 flex h-12 items-center border-r border-white/30 px-3 hover:bg-[#1A557F]"
                >
                    <LogoIconWhite className="h-[26px] w-[27px]" />
                </a>
                <Link
                    to={paths.home}
                    className="min-w-[30vw] border-r border-white/30 p-3 text-sm font-medium text-white no-underline"
                >
                    {i18n.t('{{title}} - Data Analytics Lab', { title })}
                </Link>
                {navItems().map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `p-3 text-white no-underline ${isActive ? 'bg-[#1A557F]' : 'hover:bg-[#1A557F]'}`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>
            <div className="flex items-center">
                <IconLink
                    href={joinUrl(baseUrl, 'dhis-web-interpretation')}
                    label={i18n.t('Interpretations')}
                    count={notifications?.unreadInterpretations}
                    icon={<IconMessages24 color="white" />}
                />
                <IconLink
                    href={joinUrl(baseUrl, 'dhis-web-messaging')}
                    label={i18n.t('Messages')}
                    count={notifications?.unreadMessageConversations}
                    icon={<IconMail24 color="white" />}
                />
                <AppsMenu />
                <ProfileMenu />
            </div>
        </nav>
    )
}

/**
 * Inside the DHIS2 Global Shell only the app's navigation: the shell already shows the
 * DHIS2 header bar (logo, messages, apps, profile), which would otherwise appear twice.
 */
export const AppHeader = () => (isInGlobalShell() ? <ShellNavigation /> : <FullHeader />)
