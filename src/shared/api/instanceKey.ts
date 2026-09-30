import type { InstanceConnection } from './instanceClient'

/** Stable, token-free identifier of an instance, for query keys. */
export const instanceKey = (instance?: InstanceConnection): string =>
    !instance || instance.isCurrentInstance ? 'current' : (instance.url ?? 'unknown')
