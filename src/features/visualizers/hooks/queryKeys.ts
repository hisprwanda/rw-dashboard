export const visualKeys = {
    all: ['visuals'] as const,
    list: () => [...visualKeys.all, 'list'] as const,
    detail: (id: string) => [...visualKeys.all, 'detail', id] as const,
}
