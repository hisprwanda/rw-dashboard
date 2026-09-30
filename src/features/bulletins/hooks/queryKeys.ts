import { instanceKey, type InstanceConnection } from '@/shared/api'

export const bulletinKeys = {
    all: ['bulletins'] as const,
    list: () => [...bulletinKeys.all, 'list'] as const,
    detail: (id: string) => [...bulletinKeys.all, 'detail', id] as const,
    issue: (templateId: string, periodId: string) =>
        [...bulletinKeys.all, 'issue', templateId, periodId] as const,
    programs: (instance: InstanceConnection | undefined, programType: string | undefined) =>
        ['bulletinMetadata', instanceKey(instance), 'programs', programType ?? 'all'] as const,
    programFields: (instance: InstanceConnection | undefined, programId: string) =>
        ['bulletinMetadata', instanceKey(instance), 'programFields', programId] as const,
    dataSets: (instance: InstanceConnection | undefined) =>
        ['bulletinMetadata', instanceKey(instance), 'dataSets'] as const,
    section: (
        instance: InstanceConnection | undefined,
        section: unknown,
        periodId: string,
        orgUnits: unknown
    ) => ['bulletinSection', instanceKey(instance), section, periodId, orgUnits] as const,
}
