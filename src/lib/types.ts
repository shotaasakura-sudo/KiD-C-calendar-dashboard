export type Project = {
    id: string
    name: string
    color: string // Tailwind color class or hex
}

export type AppSettings = {
    title: string
    iconUrl?: string
}

export type ScheduleEvent = {
    id: string
    projectIds: string[]
    title: string
    startDate: string // YYYY-MM-DD format
    endDate: string // YYYY-MM-DD format
    description?: string // 詳細説明 (オプション)
    location?: string // 場所 (オプション)
    isAllDay?: boolean // 終日イベントかどうか
    startTime?: string // HH:mm format (時間指定イベントの場合)
    endTime?: string // HH:mm format (時間指定イベントの場合)
}
