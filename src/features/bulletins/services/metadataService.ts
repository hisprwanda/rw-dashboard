import type { InstanceClient } from '@/shared/api'
import type { IdentifiableObject } from '@/shared/types/dhis2.types'
import type { MetadataRef } from '../types/bulletin.types'

const toRef = (item: IdentifiableObject): MetadataRef => ({
    id: item.id,
    name: item.displayName ?? item.name ?? item.id,
})

const byName = (a: MetadataRef, b: MetadataRef) => a.name.localeCompare(b.name)

type ProgramType = 'WITH_REGISTRATION' | 'WITHOUT_REGISTRATION'

/** Programs of an instance; `WITH_REGISTRATION` = tracker, `WITHOUT_REGISTRATION` = events. */
export const fetchPrograms = async (
    client: InstanceClient,
    programType: ProgramType | undefined,
    signal?: AbortSignal
): Promise<MetadataRef[]> => {
    const response = await client.get<{ programs?: IdentifiableObject[] }>(
        'programs',
        {
            fields: 'id,displayName',
            paging: false,
            ...(programType ? { filter: `programType:eq:${programType}` } : {}),
        },
        signal
    )
    return (response.programs ?? []).map(toRef).sort(byName)
}

interface ProgramFieldsResponse {
    programTrackedEntityAttributes?: Array<{ trackedEntityAttribute?: IdentifiableObject }>
    programStages?: Array<{
        programStageDataElements?: Array<{ dataElement?: IdentifiableObject }>
    }>
}

/** Attributes and data elements of a program (for "group by" / "code" fields). */
export const fetchProgramFields = async (
    client: InstanceClient,
    programId: string,
    signal?: AbortSignal
): Promise<{ attributes: MetadataRef[]; dataElements: MetadataRef[] }> => {
    const response = await client.get<ProgramFieldsResponse>(
        `programs/${programId}`,
        {
            fields: [
                'programTrackedEntityAttributes[trackedEntityAttribute[id,displayName]]',
                'programStages[programStageDataElements[dataElement[id,displayName]]]',
            ].join(','),
        },
        signal
    )
    const attributes = (response.programTrackedEntityAttributes ?? []).flatMap((item) =>
        item.trackedEntityAttribute ? [toRef(item.trackedEntityAttribute)] : []
    )
    // A data element used in several stages is listed once.
    const dataElements = new Map<string, MetadataRef>()
    for (const stage of response.programStages ?? []) {
        for (const item of stage.programStageDataElements ?? []) {
            if (item.dataElement) dataElements.set(item.dataElement.id, toRef(item.dataElement))
        }
    }
    return {
        attributes: attributes.sort(byName),
        dataElements: [...dataElements.values()].sort(byName),
    }
}

export const fetchDataSets = async (
    client: InstanceClient,
    signal?: AbortSignal
): Promise<MetadataRef[]> => {
    const response = await client.get<{ dataSets?: IdentifiableObject[] }>(
        'dataSets',
        { fields: 'id,displayName', paging: false },
        signal
    )
    return (response.dataSets ?? []).map(toRef).sort(byName)
}

export interface UiLocale {
    locale: string
    name: string
}

/** Interface languages available on an instance (for bulletin content languages). */
export const fetchUiLocales = async (
    client: InstanceClient,
    signal?: AbortSignal
): Promise<UiLocale[]> => {
    const locales = await client.get<UiLocale[]>('locales/ui', undefined, signal)
    return [...locales].sort((a, b) => a.name.localeCompare(b.name))
}
