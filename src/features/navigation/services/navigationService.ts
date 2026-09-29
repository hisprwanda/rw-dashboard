import { fetchResource, type DataEngine } from '@/shared/api'
import type { ModuleApp, UserNotifications } from '../types/navigation.types'

export const fetchModules = async (engine: DataEngine, signal?: AbortSignal) =>
    (
        await fetchResource<{ modules?: ModuleApp[] }>(
            engine,
            'action::menu/getModules',
            undefined,
            signal
        )
    ).modules ?? []

export const fetchNotifications = (engine: DataEngine, signal?: AbortSignal) =>
    fetchResource<UserNotifications>(engine, 'me/dashboard', undefined, signal)
