export const musicKeys = {
    all: ['presentationMusic'] as const,
    list: (baseUrl: string) => [...musicKeys.all, 'list', baseUrl] as const,
}
