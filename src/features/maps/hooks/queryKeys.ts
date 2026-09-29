export const mapKeys = {
    all: ['maps'] as const,
    list: () => [...mapKeys.all, 'list'] as const,
    detail: (id: string) => [...mapKeys.all, 'detail', id] as const,
}
