/** A user as stored on saved items (`createdBy`, `updatedBy`). */
export interface UserRef {
    id: string
    name: string
}

export type GeneralAccess = 'No access' | 'View only' | 'View and edit'

export interface SharingEntry {
    id: string
    name?: string
    type: 'User' | 'Group' | (string & {})
    accessLevel?: string
}

/** Ownership + sharing fields that saved visuals, maps and dashboards may carry. */
export interface Shareable {
    createdBy?: Partial<UserRef>
    generalDashboardAccess?: GeneralAccess | (string & {})
    sharing?: SharingEntry[]
}
