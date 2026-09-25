import { hasAuthorities } from '../utils/authorities'
import { useMe } from './useMe'

/** True when the current user has every one of the given authorities. */
export const useHasAuthority = (required: string | readonly string[]): boolean => {
    const { data: me } = useMe()
    const list = typeof required === 'string' ? [required] : required
    return hasAuthorities(me?.authorities ?? [], list)
}
