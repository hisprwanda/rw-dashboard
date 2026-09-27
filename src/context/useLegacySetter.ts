import type { SetStateAction } from 'react'
import { useCallback } from 'react'
import { useAppDispatch, useAppStore, type RootState } from '@/app/store'

type AppAction = Parameters<ReturnType<typeof useAppDispatch>>[0]

/**
 * TEMPORARY bridge (Phases 3–8): a `useState`-style setter (value or updater function)
 * that writes to Redux, so legacy AuthContext consumers keep working unchanged.
 * `select` and `toAction` must be stable (module-level) functions.
 */
export const useLegacySetter = <T>(
    select: (state: RootState) => T,
    toAction: (value: T) => AppAction
) => {
    const dispatch = useAppDispatch()
    const store = useAppStore()
    return useCallback(
        (next: SetStateAction<T>) => {
            const value =
                typeof next === 'function'
                    ? (next as (previous: T) => T)(select(store.getState()))
                    : next
            dispatch(toAction(value))
        },
        [dispatch, store, select, toAction]
    )
}
