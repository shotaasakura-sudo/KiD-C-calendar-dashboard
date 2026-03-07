"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { MonthView } from '@/components/MonthView'
import { YearView } from '@/components/YearView'
import { EventModal } from '@/components/EventModal'
import { useScheduleData } from '@/hooks/useScheduleData'
import { ScheduleEvent, Project } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month')
  const { events, projects, isLoading, error } = useScheduleData()

  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [visibleProjectIds, setVisibleProjectIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (projects.length > 0 && visibleProjectIds.size === 0) {
      setVisibleProjectIds(new Set(projects.map(p => p.id)))
    }
  }, [projects])

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const toggleProjectVisibility = (projectId: string) => {
    const next = new Set(visibleProjectIds)
    if (next.has(projectId)) {
      next.delete(projectId)
    } else {
      next.add(projectId)
    }
    setVisibleProjectIds(next)
  }

  const filteredEvents = events.filter(e => visibleProjectIds.has(e.projectId))

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      <Header viewMode={viewMode} setViewMode={setViewMode} />

      {/* Project Filter UI */}
      {!isLoading && !error && projects.length > 0 && (
        <div className="bg-white border-b border-neutral-200 px-4 py-3 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-sm sticky top-[73px] z-10 transition-all duration-300">
          <span className="text-xs font-semibold text-neutral-500 shrink-0 mr-2 flex items-center gap-1">
            表示案件
          </span>
          <div className="flex gap-2 min-w-max">
            {projects.map(project => {
              const isVisible = visibleProjectIds.has(project.id)
              return (
                <button
                  key={project.id}
                  onClick={() => toggleProjectVisibility(project.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 border focus:outline-none focus:ring-2 focus:ring-neutral-200",
                    isVisible
                      ? "bg-white border-neutral-200 shadow-sm text-neutral-700"
                      : "bg-neutral-50 border-transparent text-neutral-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full", project.color)} />
                  <span>{project.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 h-full min-h-[700px] p-4 sm:p-6 lg:p-8 flex flex-col relative overflow-hidden">

          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50 rounded-2xl backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
                <div className="w-10 h-10 border-4 border-neutral-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-neutral-500 font-medium">スケジュールの読み込み中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
              <div className="bg-red-50 text-red-600 p-4 rounded-xl max-w-lg mb-4 border border-red-100">
                <p className="font-semibold mb-1">データの取得に失敗しました</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
              <p className="text-neutral-500 text-sm">
                Google Calendar APIの環境変数を設定するか、<br />
                開発用のモックデータを有効（NEXT_PUBLIC_USE_MOCK_DATA=true）にしてください。
              </p>
            </div>
          ) : (
            viewMode === 'month' ? (
              <MonthView
                events={filteredEvents}
                projects={projects}
                onEventClick={handleEventClick}
              />
            ) : (
              <YearView
                events={filteredEvents}
                projects={projects}
                onEventClick={handleEventClick}
              />
            )
          )}
        </div>
      </main>

      <EventModal
        event={selectedEvent}
        project={projects.find(p => p.id === selectedEvent?.projectId)}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
