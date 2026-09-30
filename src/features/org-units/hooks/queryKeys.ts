import { instanceKey, type InstanceConnection } from '@/shared/api'

export const orgUnitKeys = {
    all: ['orgUnits'] as const,
    metadata: (instance?: InstanceConnection) =>
        [...orgUnitKeys.all, 'metadata', instanceKey(instance)] as const,
    children: (instance: InstanceConnection | undefined, parentId: string) =>
        [...orgUnitKeys.all, 'children', instanceKey(instance), parentId] as const,
    name: (instance: InstanceConnection | undefined, id: string) =>
        [...orgUnitKeys.all, 'name', instanceKey(instance), id] as const,
}
