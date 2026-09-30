import { useConfig } from '@dhis2/app-runtime'
import type { SupportedCalendar } from '@dhis2/multi-calendar-dates/build/types/types'
import { toSupportedCalendar } from '../utils/calendar'

/** The instance's calendar (System Settings > Calendar). */
export const useSystemCalendar = (): SupportedCalendar => {
    const { systemInfo } = useConfig()
    return toSupportedCalendar((systemInfo as { calendar?: string } | undefined)?.calendar)
}
