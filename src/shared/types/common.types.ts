/** A user as stored on saved items (`createdBy`, `updatedBy`). */
export interface UserRef {
    id: string
    name: string
}

export type AccessLevel = 'View only' | 'View and edit'
export type GeneralAccess = 'No access' | AccessLevel

/** A user or user group found by `GET /api/sharing/search`. */
export interface SharingCandidate {
    id: string
    name: string
    type: 'User' | 'Group'
}

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
