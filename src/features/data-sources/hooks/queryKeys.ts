export const dataSourceKeys = {
    all: ['dataSources'] as const,
    list: () => [...dataSourceKeys.all, 'list'] as const,
}
