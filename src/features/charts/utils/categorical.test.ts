import { colorByEntity, OTHER_COLOR, textColorOn } from './categorical'

const palette = { name: 'p', itemsBackgroundColors: ['#111111', '#222222', '#333333'] }
const values = (count: number) =>
    Array.from({ length: count }, (_, index) => ({ name: `s${index}`, value: index + 1 }))

describe('colorByEntity', () => {
    it('gives each value the hue of its position', () => {
        expect(colorByEntity(values(3), palette, 'Other').map(({ color }) => color)).toEqual([
            '#111111',
            '#222222',
            '#333333',
        ])
    })

    it('shows one value too many in gray instead of hiding it in "Other"', () => {
        const result = colorByEntity(values(4), palette, 'Other')
        expect(result).toHaveLength(4)
        expect(result[3]?.color).toBe(OTHER_COLOR)
    })

    it('folds the rest into "Other" without cycling hues', () => {
        const result = colorByEntity(values(6), palette, 'Other')
        expect(result.map(({ name }) => name)).toEqual(['s0', 's1', 'Other'])
        expect(result[2]).toMatchObject({ value: 3 + 4 + 5 + 6, isOther: true, color: OTHER_COLOR })
    })
})

describe('textColorOn', () => {
    it('uses ink on light fills and white on dark ones', () => {
        expect(textColorOn('#eda100')).toBe('#1f1f1d')
        expect(textColorOn('#1c5cab')).toBe('#ffffff')
    })
})
