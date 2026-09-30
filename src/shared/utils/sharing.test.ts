import { isCreatedBy, isSharedWith } from './sharing'

const me = 'me'
const mine = { createdBy: { id: me } }
const publicItem = { createdBy: { id: 'x' }, generalDashboardAccess: 'View only' }
const privateItem = { createdBy: { id: 'x' }, generalDashboardAccess: 'No access' }

describe('sharing', () => {
    it('recognises own items', () => {
        expect(isCreatedBy(mine, me)).toBe(true)
        expect(isCreatedBy(mine, undefined)).toBe(false)
        expect(isSharedWith(mine, me)).toBe(false)
    })

    it('shows public items from others', () => {
        expect(isSharedWith(publicItem, me)).toBe(true)
        expect(isSharedWith(privateItem, me)).toBe(false)
    })

    it('shows private items shared with the user or one of their groups', () => {
        expect(isSharedWith({ ...privateItem, sharing: [{ id: me, type: 'User' }] }, me)).toBe(true)
        expect(
            isSharedWith({ ...privateItem, sharing: [{ id: 'g1', type: 'Group' }] }, me, ['g1'])
        ).toBe(true)
        expect(
            isSharedWith({ ...privateItem, sharing: [{ id: 'g1', type: 'Group' }] }, me, ['g2'])
        ).toBe(false)
    })

    it('treats items without sharing info as private', () => {
        expect(isSharedWith({ createdBy: { id: 'x' } }, me)).toBe(false)
    })
})
