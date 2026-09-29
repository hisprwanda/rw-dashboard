import i18n from '@dhis2/d2-i18n'

export const mapTypeLabel = (type: string): string =>
    type === 'Thematic' ? i18n.t('Thematic') : type
