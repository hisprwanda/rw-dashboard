import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    IconInfo24,
    IconLogOut24,
    IconQuestion24,
    IconSettings24,
    IconUser24,
    Menu,
    MenuItem,
} from '@dhis2/ui'
import { useMe } from '@/features/auth'
import { initialsOf, joinUrl } from '../utils/links'
import { HeaderMenu } from './HeaderMenu'

const Avatar = ({ name, large = false }: { name: string | undefined; large?: boolean }) => (
    <span
        className={`flex items-center justify-center rounded-full font-semibold text-white ${
            large ? 'h-12 w-12 bg-[#666F7B] text-xl' : 'h-9 w-9 bg-gray-800 text-sm'
        }`}
    >
        {initialsOf(name)}
    </span>
)

/** Current user and links to the profile app and logout. */
export const ProfileMenu = () => {
    const { baseUrl } = useConfig()
    const { data: me } = useMe()
    const profile = (path: string) => joinUrl(baseUrl, `dhis-web-user-profile/#/${path}`)
    const links = [
        { label: i18n.t('Settings'), icon: <IconSettings24 />, href: profile('settings') },
        { label: i18n.t('Account'), icon: <IconUser24 />, href: profile('account') },
        {
            label: i18n.t('Help'),
            icon: <IconQuestion24 />,
            href: joinUrl(baseUrl, 'dhis-web-commons-about/help.action'),
        },
        { label: i18n.t('About'), icon: <IconInfo24 />, href: profile('aboutPage') },
        {
            label: i18n.t('Log out'),
            icon: <IconLogOut24 />,
            href: joinUrl(baseUrl, 'dhis-web-commons-security/logout.action'),
        },
    ]
    return (
        <HeaderMenu
            label={i18n.t('Profile')}
            trigger={<Avatar name={me?.displayName ?? me?.name} />}
        >
            {() => (
                <div className="w-80 bg-white text-gray-800">
                    <div className="flex gap-4 border-b border-gray-200 py-5 pl-6">
                        <Avatar name={me?.displayName ?? me?.name} large />
                        <div>
                            <p className="m-0 text-base">{me?.displayName ?? me?.name}</p>
                            {me?.email && <p className="m-0 text-sm">{me.email}</p>}
                            <a className="text-xs underline" href={profile('profile')}>
                                {i18n.t('Edit profile')}
                            </a>
                        </div>
                    </div>
                    <Menu>
                        {links.map((link) => (
                            <MenuItem
                                key={link.label}
                                icon={link.icon}
                                label={link.label}
                                href={link.href}
                            />
                        ))}
                    </Menu>
                </div>
            )}
        </HeaderMenu>
    )
}
