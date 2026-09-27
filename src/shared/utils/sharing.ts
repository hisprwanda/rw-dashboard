import type { Shareable } from '../types/common.types'

const PUBLIC_ACCESS = ['View only', 'View and edit']

export const isCreatedBy = (item: Shareable, userId: string | undefined): boolean =>
    !!userId && item.createdBy?.id === userId

/**
 * Created by someone else AND visible to the user: public ("View only" / "View and
 * edit"), shared with the user directly, or with one of the user's groups.
 */
export const isSharedWith = (
    item: Shareable,
    userId: string | undefined,
    userGroupIds: readonly string[] = []
): boolean => {
    if (!userId || isCreatedBy(item, userId)) return false
    if (item.generalDashboardAccess && PUBLIC_ACCESS.includes(item.generalDashboardAccess)) {
        return true
    }
    return (item.sharing ?? []).some((share) =>
        share.type === 'User'
            ? share.id === userId
            : share.type === 'Group' && userGroupIds.includes(share.id)
    )
}
