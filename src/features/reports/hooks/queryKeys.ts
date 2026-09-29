export const reportKeys = {
    all: ['bulletin'] as const,
    template: () => [...reportKeys.all, 'template'] as const,
    tracker: (range: { startDate: string; endDate: string } | null) =>
        [...reportKeys.all, 'tracker', range] as const,
}
