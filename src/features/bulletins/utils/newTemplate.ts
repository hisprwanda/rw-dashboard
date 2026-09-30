import { CURRENT_INSTANCE_ID } from '@/features/data-sources'
import type { UserRef } from '@/shared/types/common.types'
import { generateUid } from '@/shared/utils/uid'
import type { BulletinSection, BulletinTemplate } from '../types/bulletin.types'
import { newSection } from './newSection'
import { defaultBulletinOrgUnits } from './orgUnits'

/** A new weekly bulletin on the current instance, in the user's language. */
export const newTemplate = (
    name: string,
    language: string,
    author: UserRef,
    now: number,
    sections: BulletinSection[] = [newSection('cover'), newSection('notes')]
): BulletinTemplate => ({
    id: generateUid(),
    name,
    description: '',
    dataSourceId: CURRENT_INSTANCE_ID,
    periodType: 'WEEKLY',
    orgUnits: defaultBulletinOrgUnits(),
    languages: [language],
    sections,
    createdBy: author,
    updatedBy: author,
    createdAt: now,
    updatedAt: now,
})
