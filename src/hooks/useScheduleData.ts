import { useState, useEffect, useCallback } from 'react'
import { ScheduleEvent, Project } from '@/lib/types'
import { mockEvents, mockProjects } from '@/lib/dummyData'

export function useScheduleData() {
    const [events, setEvents] = useState<ScheduleEvent[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true)
            // 環境変数でモックデータを使用するかどうかを判定
            const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

            if (useMock) {
                setEvents(mockEvents)
                setProjects(mockProjects)
            } else {
                const res = await fetch('/api/calendar')
                if (!res.ok) {
                    throw new Error('Failed to fetch calendar data')
                }
                const data = await res.json()

                if (data.error) {
                    throw new Error(data.error)
                }

                setEvents(data.events || [])
                setProjects(data.projects || []) 
            }
        } catch (err: any) {
            console.error(err)
            setError(err.message)
            // エラー時はフォールバックとしてモックを表示
            setEvents(mockEvents)
            setProjects(mockProjects)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { events, projects, isLoading, error, refetch: fetchData }
}
