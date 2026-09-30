import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { fromTemplateFile } from './templateFile'

const dir = join(__dirname, '../../../../docs/bulletin-presets')

describe('bulletin presets', () => {
    const files = readdirSync(dir).filter((file) => file.endsWith('.json'))

    it('exist', () => expect(files.length).toBeGreaterThan(0))

    it.each(files)('%s is a valid template file', (file) => {
        const result = fromTemplateFile(
            readFileSync(join(dir, file), 'utf8'),
            { id: 'u', name: 'U' },
            1,
            []
        )
        if (!result.ok) throw new Error(`${result.error} ${result.details ?? ''}`)
        expect(result.template.sections.length).toBeGreaterThan(0)
    })
})
