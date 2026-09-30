/** A titled alert of the EIOS section. */
export interface BulletinAlert {
    title: string
    content: string
}

/**
 * Static texts of the bulletin, stored in the dataStore (see env `bulletinStore`).
 * All parts are optional: a missing text simply renders nothing.
 */
export interface BulletinTemplate {
    page1?: { titles?: string[]; body_content?: string[] }
    page2?: {
        main_titles?: string[]
        sub_titles?: string[]
        body_content?: {
            Alert_from_EIOS?: string[]
            outbreaks_updates?: string[]
            completness?: string[]
        }
    }
    page3?: {
        main_titles?: string[]
        sub_titles?: string[]
        body_content?: {
            description?: string[]
            Alert_from_EIOS?: Array<string | BulletinAlert[]>
        }
    }
    page4?: {
        main_titles?: string[]
        sub_titles?: string[]
        body_content?: { description?: string }
    }
    pages?: {
        main_titles?: string[]
        sub_titles?: string[]
        reportable_description?: string[]
        body_content?: { completness_description?: string[]; timeless_completness?: string[] }
    }
}

export interface NameValue {
    name: string
    value: number
}

/** What the bulletin shows from the tracker programs for one week. */
export interface BulletinTrackerSummary {
    /** "12 cases of Measles reported by 3 HFs" */
    diseaseMessages: string[]
    deathMessages: string[]
    publicEventMessages: string[]
    highlights: string[]
    deathsDescription: string
    pieDescription: string
    totalDeaths: number
    totalEnrollments: number
    deathsByType: NameValue[]
    deathsByFacility: NameValue[]
    /** Community alerts (signals + malaria). */
    communityMessages: string[]
    communityAlerts: string[]
    totalCommunityEvents: number
}

/** Raw tracker rows used by the summaries. */
export interface TrackedEntityRow {
    orgUnit: string
    attributes?: Array<{ attribute: string; value: string }>
}

export interface TrackerEventRow {
    orgUnit: string
    dataValues?: Array<{ dataElement: string; value: string }>
}
