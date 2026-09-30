import i18n from '@dhis2/d2-i18n'
import { useMe } from './useMe'

/** `NAME` or `SHORTNAME`, as chosen in the user's analytics settings. */
export const useDisplayProperty = (): 'NAME' | 'SHORTNAME' => {
    const { data: me } = useMe()
    return me?.settings?.keyAnalysisDisplayProperty === 'shortName' ? 'SHORTNAME' : 'NAME'
}

/** The user's interface language (`fr`, `en`…), as applied by the app platform. */
export const useUserLocale = (): string => {
    const { data: me } = useMe()
    return me?.settings?.keyUiLocale || i18n.language || 'en'
}
