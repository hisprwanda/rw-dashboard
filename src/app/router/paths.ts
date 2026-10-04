/** Every route of the app. Build links with these helpers, never with string literals. */
export const paths = {
    home: '/',
    dashboards: '/dashboards',
    dashboard: (id?: string) => (id ? `/dashboard/${id}` : '/dashboard'),
    presentDashboard: (id: string) => `/dashboard/${id}/present`,
    visualizations: '/visualization',
    visualizer: (id?: string) => (id ? `/visualizers/${id}` : '/visualizers'),
    maps: '/maps',
    map: (id?: string, name?: string) =>
        id ? `/map/${id}${name ? `/${encodeURIComponent(name)}` : ''}` : '/map',
    bulletins: '/bulletins',
    newBulletin: '/bulletins/new',
    editBulletin: (id: string) => `/bulletins/${id}/edit`,
    bulletinIssue: (id: string, periodId?: string) =>
        periodId ? `/bulletins/${id}/${periodId}` : `/bulletins/${id}`,
    settings: '/settings',
    musicSettings: '/settings/music',
    dataSources: '/datasource',
    unauthorized: '/unauthorized',
} as const
