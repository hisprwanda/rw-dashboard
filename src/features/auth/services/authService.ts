import { fetchResource, type DataEngine } from '@/shared/api'
import type { Me } from '@/shared/types/dhis2.types'

const ME_FIELDS = [
    'id',
    'username',
    'name',
    'displayName',
    'authorities',
    'settings',
    'userGroups[id,name,displayName]',
    'organisationUnits[id,displayName,path,level]',
].join(',')

export const fetchMe = (engine: DataEngine, signal?: AbortSignal) =>
    fetchResource<Me>(engine, 'me', { fields: ME_FIELDS }, signal)
