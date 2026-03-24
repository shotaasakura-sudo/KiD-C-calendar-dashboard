import { useState } from 'react'
import { format, addYears, subYears, startOfYear, endOfYear, eachMonthOfInterval, getDaysInMonth, differenceInDays, isSameMonth } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScheduleEvent, Project } from '@/lib/types'

interface YearViewProps {
    events: ScheduleEvent[]
    projects: Project[]
    onEventClick?: (event: ScheduleEvent) => void
}

export function YearView({ events, projects, onEventClick }: YearViewProps) {
    const [currentYear, setCurrentYear] = useState(new Date())

    const yearStart = startOfYear(currentYear)
    const yearEnd = endOfYear(currentYear)
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })
    const totalDaysInYear = differenceInDays(yearEnd, yearStart) + 1

    const nextYear = () => setCurrentYear(addYears(currentYear, 1))
    const prevYear = () => setCurrentYear(subYears(currentYear, 1))
    const thisYear = () => setCurrentYear(new Date())

    const today = new Date()

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold flex gap-2 items-center text-neutral-800">
                    {format(currentYear, 'yyyy年')}
                </h2>
                <div className="flex gap-2">
                    <button onClick={thisYear} className="px-3 py-1 text-xs sm:text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 font-medium transition-colors text-neutral-700 bg-white shadow-sm">
                        今年
                    </button>
                    <div className="flex border border-neutral-300 bg-white rounded-md overflow-hidden shadow-sm">
                        <button onClick={prevYear} className="p-1 sm:p-1.5 hover:bg-neutral-50 border-r border-neutral-300 transition-colors text-neutral-600">
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={nextYear} className="p-1 sm:p-1.5 hover:bg-neutral-50 transition-colors text-neutral-600">
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-[500px] border border-neutral-200 bg-white rounded-xl overflow-x-auto no-scrollbar shadow-sm">
                <div className="min-w-[800px] flex flex-col h-full">
                    {/* Header Row */}
                    <div className="flex border-b border-neutral-200 bg-neutral-50 sticky top-0 z-30">
                        <div className="w-40 sm:w-56 border-r border-neutral-200 shrink-0 p-3 font-semibold text-neutral-700 text-sm flex items-center justify-center bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            案件 / プロジェクト
                        </div>
                        <div className="flex-1 flex border-b border-neutral-200">
                            {months.map(month => (
                                <div
                                    key={month.toString()}
                                    className={cn(
                                        "border-r border-neutral-200 last:border-r-0 p-2 text-center text-xs sm:text-sm font-medium text-neutral-600 flex items-center justify-center relative",
                                        isSameMonth(month, today) && "text-blue-600 font-bold bg-blue-50/50"
                                    )}
                                    style={{ flex: getDaysInMonth(month) }}
                                >
                                    {format(month, 'M月')}
                                    {isSameMonth(month, today) && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gantt Chart Body */}
                    <div className="flex-1 flex flex-col relative bg-neutral-50/20">
                        {/* Background Grid */}
                        <div className="absolute inset-0 flex pointer-events-none z-0">
                            <div className="w-40 sm:w-56 border-r border-neutral-200 shrink-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]" />
                            <div className="flex-1 flex relative">
                                {months.map(month => (
                                    <div
                                        key={`grid-${month}`}
                                        className={cn(
                                            "border-r border-neutral-200 last:border-r-0",
                                            isSameMonth(month, today) && "bg-blue-50/20"
                                        )}
                                        style={{ flex: getDaysInMonth(month) }}
                                    />
                                ))}

                                {/* Today Line Indicator */}
                                {currentYear.getFullYear() === today.getFullYear() && (
                                    <div
                                        className="absolute top-0 bottom-0 pointer-events-none z-10 border-l-[2px] border-blue-500/50 hidden sm:block"
                                        style={{
                                            left: `${(differenceInDays(today, yearStart) / totalDaysInYear) * 100}%`
                                        }}
                                    >
                                        <div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-blue-500" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Projects and Events */}
                        <div className="flex-1 overflow-y-auto z-10 relative">
                            {projects.map((project, idx) => {
                                const projectEvents = events.filter(e => e.projectIds.includes(project.id))

                                return (
                                    <div key={project.id} className={cn(
                                        "flex min-h-[80px] hover:bg-neutral-50/80 transition-colors relative",
                                        idx !== projects.length - 1 && "border-b border-neutral-100"
                                    )}>
                                        <div className="w-40 sm:w-56 border-r border-neutral-200 shrink-0 p-3 sm:p-4 flex flex-col justify-center bg-white/90 backdrop-blur-sm sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 shadow-sm", project.color)} />
                                                <span className="font-semibold text-xs sm:text-sm text-neutral-800 line-clamp-2">{project.name}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 relative py-3 sm:py-4">
                                            {projectEvents.map(event => {
                                                const startDate = new Date(event.startDate)
                                                const endDate = new Date(event.endDate)

                                                // Skip if event is completely outside the current year
                                                if (endDate < yearStart || startDate > yearEnd) return null

                                                const visibleStart = startDate < yearStart ? yearStart : startDate
                                                const visibleEnd = endDate > yearEnd ? yearEnd : endDate

                                                const startOffsetDays = differenceInDays(visibleStart, yearStart)
                                                const durationDays = differenceInDays(visibleEnd, visibleStart) + 1

                                                const leftPercent = (startOffsetDays / totalDaysInYear) * 100
                                                const widthPercent = (durationDays / totalDaysInYear) * 100

                                                return (
                                                    <div
                                                        key={event.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onEventClick?.(event)
                                                        }}
                                                        className={cn(
                                                            "absolute top-1/2 -translate-y-1/2 h-7 sm:h-8 rounded-md shadow-sm flex items-center px-2 sm:px-3 text-[10px] sm:text-xs font-semibold text-white overflow-hidden whitespace-nowrap transition-transform hover:scale-[1.02] cursor-pointer z-30",
                                                            project.color,
                                                            startDate < yearStart && "rounded-l-none border-l-2 border-white/50",
                                                            endDate > yearEnd && "rounded-r-none border-r-2 border-white/50"
                                                        )}
                                                        style={{
                                                            left: `${leftPercent}%`,
                                                            width: `${widthPercent}%`
                                                        }}
                                                        title={`${event.title}\n開始: ${event.startDate}\n終了: ${event.endDate}`}
                                                    >
                                                        <span className="truncate drop-shadow-sm">{event.title}</span>
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
            </div>
        </div>
    )
}
