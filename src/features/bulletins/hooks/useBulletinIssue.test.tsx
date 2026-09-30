import { act, waitFor } from '@testing-library/react'
import { renderHookWithProviders } from '@/shared/testing'
import type { BulletinIssue } from '../types/bulletin.types'
import { useBulletinIssue, useSaveBulletinIssue } from './useBulletinIssue'

const notFound = () => Object.assign(new Error('Not found'), { details: { httpStatusCode: 404 } })

const issue: BulletinIssue = {
    templateId: 'b1',
    periodId: '2024W1',
    status: 'draft',
    notes: { n1: { en: 'Text' } },
    outbreaks: {},
    updatedBy: { id: 'u', name: 'U' },
    updatedAt: 1,
}

describe('bulletin issues', () => {
    it('reads a missing issue as null', async () => {
        const { result } = renderHookWithProviders(() => useBulletinIssue('b1', '2024W1'), {
            data: {
                'dataStore/BULLETIN_ISSUES_STORE/b1_2024W1': () => {
                    throw notFound()
                },
            },
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toBeNull()
    })

    it('creates the issue when it does not exist yet', async () => {
        const calls: string[] = []
        const { result, queryClient } = renderHookWithProviders(() => useSaveBulletinIssue(), {
            data: {
                // `replace` targets the namespace with the key as id.
                'dataStore/BULLETIN_ISSUES_STORE': (type: string) => {
                    calls.push(type)
                    throw notFound()
                },
                'dataStore/BULLETIN_ISSUES_STORE/b1_2024W1': (type: string) => {
                    calls.push(type)
                    return {}
                },
            },
        })
        await act(() => result.current.mutateAsync(issue))
        expect(calls).toEqual(['replace', 'create'])
        expect(queryClient.getQueryData(['bulletins', 'issue', 'b1', '2024W1'])).toEqual(issue)
    })
})
