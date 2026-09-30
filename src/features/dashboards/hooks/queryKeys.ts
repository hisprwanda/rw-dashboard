export const dashboardKeys = {
    all: ['dashboards'] as const,
    list: () => [...dashboardKeys.all, 'list'] as const,
    detail: (id: string) => [...dashboardKeys.all, 'detail', id] as const,
}
