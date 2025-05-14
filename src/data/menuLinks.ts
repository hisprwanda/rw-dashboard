import i18n from '../locales/index.js'

export const menuItems = [
    {
        name: `${i18n.t('Dashboards')}`,
        link: "dashboards"
    },
    {
        name: `${i18n.t('Visualizers')}` ,   
        link: "visualization"
    },
    // {
    //     name: "Alerts",
    //     link: "alerts"
    // },
    // {
    //     name: `${i18n.t('Data Source')}`, 
    //     link: "datasource"
    // },
    {
        name: `${i18n.t('Map')}`, 
        link: "maps"
    },
    {
        name: `${i18n.t('Settings')}`, 
        link: "settings"
    },
    // {
    //     name: `${i18n.t('report')}`, 
    //     link: "report"
    // }
];