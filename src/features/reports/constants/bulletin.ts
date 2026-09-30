/** Weekly reportable diseases charted in the bulletin (Rwanda eIDSR data elements). */
export const BULLETIN_DISEASES = [
    { id: 'CxTT5NVd8o1', name: 'Simple malaria' },
    { id: 'TnhQi1knkS7', name: 'Flu syndrome' },
    { id: 'Efu7jw6Y45t', name: 'Severe pneumonia under 5 years' },
    { id: 'KLdYJhoI1yM', name: 'Rabies exposure' },
    { id: 'XCuqmbPR8vX', name: 'COVID-19' },
    { id: 'j10s9Gfed0c', name: 'Non bloody diarrhoea under 5 years' },
] as const

/** Country root org unit the tracker queries run under (with descendants). */
export const BULLETIN_ROOT_ORG_UNIT = 'Hjw70Lodtf2'

export const BULLETIN_PROGRAMS = {
    /** Immediate reportable events (tracker program with enrollments). */
    immediateReportable: 'U86iDWxDek8',
    /** Community-based surveillance signals. */
    community: 'ecvn9SiIEXz',
    /** Community malaria reporting. */
    malaria: 'zCy7bqFHOpa',
} as const

/** Tracked entity attribute holding the disease / event type of an IBS enrollment. */
export const DISEASE_TYPE_ATTRIBUTE = 'uOTHyxNv2W4'

/** Event data elements of the community programs. */
export const EVENT_DATA_ELEMENTS = {
    signalCode: 'ockM6peJ7Pe',
    signalLocation: 'OEVkQ1ds77r',
    malariaCode: 'kAnIYiYs5ni',
    malariaCases: 'B84KCmNtKPl',
} as const
