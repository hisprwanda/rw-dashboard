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
    {
        name: `${i18n.t('Data Source')}`, 
        link: "datasource"
    },
    {
        name: `${i18n.t('bulletin-settings')}`, 
        link: "bulletin-settings"
    },
    {
        name: `${i18n.t('report')}`, 
        link: "report"
    }
];