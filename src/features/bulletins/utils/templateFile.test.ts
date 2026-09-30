import { legacyTemplateToSections } from './legacyTemplate'
import { defaultBulletinOrgUnits } from './orgUnits'
import { fromTemplateFile, toTemplateFile } from './templateFile'
import { newSection } from './newSection'
import type { BulletinTemplate } from '../types/bulletin.types'

const author = { id: 'u', name: 'U' }
const template: BulletinTemplate = {
    id: 'abc',
    name: 'Weekly',
    description: '',
    dataSourceId: 'ext1',
    periodType: 'WEEKLY',
    orgUnits: defaultBulletinOrgUnits(),
    languages: ['en', 'fr'],
    sections: [newSection('text'), newSection('notes')],
    createdBy: { id: 'other', name: 'Other' },
    updatedBy: { id: 'other', name: 'Other' },
    createdAt: 1,
    updatedAt: 1,
    sharing: [{ id: 'g', type: 'Group' }],
}

describe('template files', () => {
    it('exports without ownership and imports as a new template', () => {
        const file = toTemplateFile(template)
        expect(file).not.toContain('Other')
        expect(file).not.toContain('sharing')
        const result = fromTemplateFile(file, author, 5, ['ext1'])
        if (!result.ok) throw new Error(result.error)
        expect(result.template).toMatchObject({
            name: 'Weekly',
            dataSourceId: 'ext1',
            createdBy: author,
        })
        expect(result.template.id).not.toBe('abc')
        expect(result.template.sections).toHaveLength(2)
        expect(result.template.sections[0]?.id).not.toBe(template.sections[0]?.id)
    })

    it('falls back to the current instance for unknown data sources', () => {
        const result = fromTemplateFile(toTemplateFile(template), author, 5, [])
        expect(result.ok && result.template.dataSourceId).toBe('1')
    })

    it('rejects invalid files', () => {
        expect(fromTemplateFile('not json', author, 1, [])).toMatchObject({ error: 'invalid-json' })
        expect(fromTemplateFile('{"name":""}', author, 1, [])).toMatchObject({
            error: 'invalid-template',
        })
    })
})

describe('legacyTemplateToSections', () => {
    it('turns every page into a text section, keeping all texts', () => {
        const sections = legacyTemplateToSections(
            {
                page1: { titles: ['BULLETIN', 'Highlights'], body_content: ['One', 'Two'] },
                page3: {
                    main_titles: ['Week summary'],
                    body_content: {
                        Alert_from_EIOS: ['intro', [{ title: 'Flood', content: 'North' }]],
                    },
                },
                empty: {},
            },
            'en'
        )
        expect(sections.map((s) => s.title)).toEqual([{ en: 'BULLETIN' }, { en: 'Week summary' }])
        expect(sections[0]?.type === 'text' && sections[0].body.en).toBe('Highlights\n\nOne\n\nTwo')
        expect(sections[1]?.type === 'text' && sections[1].body.en).toBe('intro\n\nFlood: North')
        expect(legacyTemplateToSections(null, 'en')).toEqual([])
    })
})
