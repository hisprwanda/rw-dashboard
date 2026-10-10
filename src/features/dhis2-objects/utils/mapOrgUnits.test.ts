import { toGeoJson, type GeoFeatureItem } from './mapGeo'
import { styleOrgUnits, withGroupDefaults } from './mapOrgUnits'

const items: GeoFeatureItem[] = [
    { id: 'r', na: 'Region', le: 2, co: '[[[0,0],[2,0],[2,2],[0,2],[0,0]]]', ty: 2 },
    { id: 'd', na: 'District', le: 3, co: '[[[0,0],[1,0],[1,1],[0,1],[0,0]]]', ty: 2 },
    { id: 'h', na: 'Hospital', le: 4, co: '[0.5,0.5]', ty: 1, dimensions: { gs: 'hosp' } },
    { id: 'c', na: 'Clinic', le: 4, co: '[1.5,0.5]', ty: 1, dimensions: { gs: 'clin' } },
    { id: 'o', na: 'Other', le: 4, co: '[1.8,1.8]', ty: 1, dimensions: {} },
]
const features = toGeoJson(items)
const groupSet = {
    id: 'gs',
    name: 'Facility type',
    organisationUnitGroups: [
        { id: 'hosp', name: 'Hospital', color: '#ff0000', symbol: '10.png' },
        { id: 'clin', name: 'Clinic' },
    ],
}

describe('withGroupDefaults', () => {
    it('sorts groups and fills missing colors and symbols as the Maps app does', () => {
        expect(withGroupDefaults(groupSet.organisationUnitGroups)).toEqual([
            { id: 'clin', name: 'Clinic', color: '#1f78b4', symbol: '21.png' },
            { id: 'hosp', name: 'Hospital', color: '#ff0000', symbol: '10.png' },
        ])
    })
})

describe('styleOrgUnits', () => {
    it('draws boundaries thinner at lower levels, with a legend per level', () => {
        const layer = styleOrgUnits({
            features: features.slice(0, 2),
            levelNames: { 2: 'Region', 3: 'District' },
            baseUrl: 'https://x',
            title: 'Org units',
        })
        const [region, district] = layer.features.map(({ properties }) => properties.weight)
        expect(Number(region)).toBeGreaterThan(Number(district))
        expect(layer.legend.entries.map(({ name, count }) => [name, count])).toEqual([
            ['Region', 1],
            ['District', 1],
        ])
    })

    it('shows facilities by group symbol and leaves out those in no group', () => {
        const layer = styleOrgUnits({
            features: features.filter(({ geometry }) => geometry.type === 'Point'),
            groupSet,
            baseUrl: 'https://play.dhis2.org/',
            title: 'Facilities',
        })
        expect(layer.features.map(({ id, properties }) => [id, properties.iconUrl])).toEqual([
            ['h', 'https://play.dhis2.org/images/orgunitgroup/10.png'],
            ['c', 'https://play.dhis2.org/images/orgunitgroup/21.png'],
        ])
        expect(layer.legend).toMatchObject({ unit: 'Facility type' })
        expect(layer.legend.entries.map(({ name, count }) => [name, count])).toEqual([
            ['Clinic', 1],
            ['Hospital', 1],
        ])
    })

    it('colors facilities by group when the style type is color', () => {
        const layer = styleOrgUnits({
            features: features.filter(({ geometry }) => geometry.type === 'Point'),
            groupSet,
            styleType: 'COLOR',
            baseUrl: 'https://x',
            title: 'Facilities',
        })
        expect(layer.features.map(({ properties }) => properties.color)).toEqual([
            '#ff0000',
            '#1f78b4',
        ])
    })
})
