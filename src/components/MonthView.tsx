import { useState } from 'react'
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScheduleEvent, Project } from '@/lib/types'

interface MonthViewProps {
    events: ScheduleEvent[]
    projects: Project[]
    onEventClick?: (event: ScheduleEvent) => void
}

export function MonthView({ events, projects, onEventClick }: MonthViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sun to Sat
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate
    })

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const today = () => setCurrentDate(new Date())

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Calendar Header with controls */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold flex gap-2 items-center text-neutral-800">
                    {format(currentDate, 'yyyy年 M月')}
                </h2>
                <div className="flex gap-2">
                    <button onClick={today} className="px-3 py-1 text-xs sm:text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 font-medium transition-colors text-neutral-700 bg-white shadow-sm">
                        今日
                    </button>
                    <div className="flex border border-neutral-300 bg-white rounded-md overflow-hidden shadow-sm">
                        <button onClick={prevMonth} className="p-1 sm:p-1.5 hover:bg-neutral-50 border-r border-neutral-300 transition-colors text-neutral-600">
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={nextMonth} className="p-1 sm:p-1.5 hover:bg-neutral-50 transition-colors text-neutral-600">
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-[500px]">
                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-px bg-neutral-200 rounded-t-xl overflow-hidden border border-neutral-200 border-b-0">
                    {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                        <div key={day} className={cn(
                            "py-2 sm:py-3 text-center text-xs sm:text-sm font-medium bg-neutral-50",
                            i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-neutral-600"
                        )}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 flex-1 gap-px bg-neutral-200 border border-neutral-200 rounded-b-xl overflow-hidden">
                    {days.map((day) => {
                        const formattedDate = format(day, 'yyyy-MM-dd')
                        // 対象となるイベントを抽出
                        const dayEvents = events.filter(e => {
                            return formattedDate >= e.startDate && formattedDate <= e.endDate
                        })

                        const isCurrentMonth = isSameMonth(day, monthStart)

                        return (
                            <div
                                key={day.toString()}
                                className={cn(
                                    "bg-white min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 flex flex-col gap-1 transition-colors group",
                                    !isCurrentMonth && "bg-neutral-50/50"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm rounded-full",
                                        !isCurrentMonth ? "text-neutral-400" :
                                            isSameDay(day, new Date()) ? "bg-blue-600 text-white font-bold" : "text-neutral-700 font-medium",
                                        isCurrentMonth && day.getDay() === 0 ? "text-red-500" : "",
                                        isCurrentMonth && day.getDay() === 6 ? "text-blue-500" : ""
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[80px] no-scrollbar">
                                    {dayEvents.map(event => {
                                        const eventProjects = projects.filter(p => event.projectIds.includes(p.id))
                                        const isStart = event.startDate === formattedDate
                                        const isEnd = event.endDate === formattedDate

                                        return (
                                            <div
                                                key={event.id}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onEventClick?.(event)
                                                }}
                                                className={cn(
                                                    "relative text-[10px] sm:text-xs px-1.5 py-0.5 sm:py-1 rounded-sm text-white shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02] cursor-pointer overflow-hidden group/event",
                                                    !isStart && "rounded-l-none border-l-[1px] border-white/20 ml-[-4px]",
                                                    !isEnd && "rounded-r-none mr-[-4px]",
                                                    !isCurrentMonth && "opacity-60"
                                                )}
                                                title={`${event.title} (${eventProjects.map(p => p.name).join(', ')})`}
                                            >
                                                <div className="absolute inset-0 flex -z-10">
                                                    {eventProjects.length > 0 ? eventProjects.map(p => (
                                                        <div key={p.id} className={cn("flex-1 h-full", p.color)} />
                                                    )) : <div className="flex-1 h-full bg-neutral-500" />}
                                                </div>
                                                <span className="relative z-10 truncate drop-shadow-sm">{isStart ? event.title : '\u00A0'}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
