import { fetchAllPages } from './fetchAllPages'
import type { InstanceClient } from './instanceClient'

const clientReturning = (pages: unknown[]) => {
    const calls: unknown[] = []
    const client: InstanceClient = {
        get: async <T>(_resource: string, params?: unknown) => {
            calls.push(params)
            return pages[calls.length - 1] as T
        },
    }
    return { client, calls }
}

describe('fetchAllPages', () => {
    it('follows the pager of the old API', async () => {
        const { client, calls } = clientReturning([
            { pager: { page: 1, pageCount: 2 }, instances: [1, 2] },
            { pager: { page: 2, pageCount: 2 }, instances: [3] },
        ])
        const rows = await fetchAllPages<number>(
            client,
            'tracker/events',
            { program: 'p' },
            {
                listKeys: ['events', 'instances'],
                pageSize: 2,
            }
        )
        expect(rows).toEqual([1, 2, 3])
        expect(calls).toEqual([
            { program: 'p', page: 1, pageSize: 2, totalPages: true },
            { program: 'p', page: 2, pageSize: 2, totalPages: true },
        ])
    })

    it('reads the new API (top-level page count, `events` list)', async () => {
        const { client } = clientReturning([{ page: 1, pageCount: 1, events: ['a'] }])
        expect(
            await fetchAllPages(client, 'tracker/events', {}, { listKeys: ['events', 'instances'] })
        ).toEqual(['a'])
    })

    it('stops on a short page when the server gives no page count', async () => {
        const { client, calls } = clientReturning([{ events: [1, 2] }, { events: [3] }])
        const rows = await fetchAllPages(client, 'x', {}, { listKeys: ['events'], pageSize: 2 })
        expect(rows).toEqual([1, 2, 3])
        expect(calls).toHaveLength(2)
    })
})
