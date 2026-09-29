import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CircularLoader, IconApps24, IconSettings24, Input } from '@dhis2/ui'
import { useState } from 'react'
import { useModules } from '../hooks/useModules'
import { filterApps, joinUrl } from '../utils/links'
import { HeaderMenu } from './HeaderMenu'

const AppsList = () => {
    const { baseUrl } = useConfig()
    const modules = useModules(true)
    const [search, setSearch] = useState('')
    const apps = filterApps(modules.data ?? [], search)
    return (
        <div className="w-[30vw] min-w-[300px] max-w-[560px] bg-white text-gray-800">
            <div className="flex items-center gap-2 p-4">
                <div className="flex-1">
                    <Input
                        dense
                        placeholder={i18n.t('Search apps')}
                        value={search}
                        onChange={({ value }) => setSearch(value ?? '')}
                    />
                </div>
                <a
                    href={joinUrl(baseUrl, 'dhis-web-menu-management')}
                    aria-label={i18n.t('Manage apps')}
                >
                    <IconSettings24 />
                </a>
            </div>
            <div className="m-2 flex max-h-[465px] min-h-[200px] flex-wrap items-start overflow-auto">
                {modules.isLoading && <CircularLoader small />}
                {apps.map((app) => (
                    <a
                        key={app.namespace}
                        href={joinUrl(baseUrl, app.defaultAction)}
                        className="m-2 flex w-24 flex-col items-center gap-2 rounded-xl p-1 text-center text-xs text-gray-800 no-underline hover:bg-[#f5fbff]"
                    >
                        <img src={joinUrl(baseUrl, app.icon)} alt="" className="m-2 h-12 w-12" />
                        {app.displayName ?? app.name}
                    </a>
                ))}
                {modules.isSuccess && !apps.length && (
                    <p className="m-2">{i18n.t('No app found')}</p>
                )}
            </div>
        </div>
    )
}

export const AppsMenu = () => (
    <HeaderMenu label={i18n.t('Apps')} trigger={<IconApps24 color="white" />}>
        {() => <AppsList />}
    </HeaderMenu>
)
