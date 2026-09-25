export const systemKeys = {
    all: ['system'] as const,
    applicationTitle: () => [...systemKeys.all, 'applicationTitle'] as const,
}
