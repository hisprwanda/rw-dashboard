/** Superusers have the `ALL` authority, which grants everything. */
const SUPERUSER_AUTHORITY = 'ALL'

export const hasAuthorities = (granted: readonly string[], required: readonly string[]) =>
    granted.includes(SUPERUSER_AUTHORITY) || required.every((a) => granted.includes(a))
