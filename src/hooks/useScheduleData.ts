import { useState, useEffect } from 'react'
import { ScheduleEvent, Project } from '@/lib/types'
import { mockEvents, mockProjects } from '@/lib/dummyData'

export function useScheduleData() {
    const [events, setEvents] = useState<ScheduleEvent[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
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

                    const fetchedEvents: ScheduleEvent[] = data.events || []
                    setEvents(fetchedEvents)

                    // APIからのイベントに含まれるプロジェクトIDを抽出し、ダミープロジェクト一覧を拡張する
                    const backendProjects = [...mockProjects]
                    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-red-500', 'bg-cyan-500', 'bg-pink-500']

                    fetchedEvents.forEach((event: ScheduleEvent) => {
                        if (!backendProjects.find(p => p.id === event.projectId)) {
                            // 簡単なハッシュ関数で色を決定するか、ランダムにする
                            const colorIdx = event.projectId.length % colors.length

                            backendProjects.push({
                                id: event.projectId,
                                name: event.projectName || `その他の案件 (${event.projectId})`,
                                color: colors[colorIdx]
                            })
                        }
                    })
                    setProjects(backendProjects)
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
        }

        fetchData()
    }, [])

    return { events, projects, isLoading, error }
}
