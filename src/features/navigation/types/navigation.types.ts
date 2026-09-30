/** An installed app, as listed by `action::menu/getModules`. */
export interface ModuleApp {
    name: string
    namespace: string
    displayName?: string
    defaultAction: string
    icon: string
    description?: string
}

/** Unread counters shown on the header icons (`me/dashboard`). */
export interface UserNotifications {
    unreadInterpretations: number
    unreadMessageConversations: number
}
