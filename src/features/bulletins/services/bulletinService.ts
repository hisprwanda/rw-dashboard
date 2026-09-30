import { dataStoreService, isNotFound, type DataEngine } from '@/shared/api'
import { env } from '@/shared/constants/env'
import type { BulletinIssue, BulletinTemplate } from '../types/bulletin.types'

export const templateService = dataStoreService<BulletinTemplate>(env.bulletinTemplatesStore)

const issues = dataStoreService<BulletinIssue>(env.bulletinIssuesStore)

/** dataStore keys only allow a limited character set: period ids are safe, ids too. */
export const issueKey = (templateId: string, periodId: string) => `${templateId}_${periodId}`

export const issueService = {
    /** The saved issue of a period, or `null` when nobody has written one yet. */
    get: async (
        engine: DataEngine,
        templateId: string,
        periodId: string,
        signal?: AbortSignal
    ): Promise<BulletinIssue | null> => {
        try {
            return await issues.get(engine, issueKey(templateId, periodId), signal)
        } catch (error) {
            if (isNotFound(error)) return null
            throw error
        }
    },
    /** Creates or replaces the issue. */
    save: async (engine: DataEngine, issue: BulletinIssue) => {
        const key = issueKey(issue.templateId, issue.periodId)
        try {
            await issues.update(engine, key, issue)
        } catch (error) {
            if (!isNotFound(error)) throw error
            await issues.create(engine, key, issue)
        }
    },
    remove: (engine: DataEngine, templateId: string, periodId: string) =>
        issues.remove(engine, issueKey(templateId, periodId)),
}
