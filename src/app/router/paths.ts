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
    report: '/report',
    settings: '/settings',
    dataSources: '/datasource',
    unauthorized: '/unauthorized',
} as const
