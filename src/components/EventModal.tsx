import { ScheduleEvent, Project } from '@/lib/types'
import { X, Clock, MapPin, AlignLeft, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventModalProps {
    event: ScheduleEvent | null
    project: Project | undefined
    isOpen: boolean
    onClose: () => void
}

export function EventModal({ event, project, isOpen, onClose }: EventModalProps) {
    if (!isOpen || !event) return null

    // モーダルの外側をクリックしたときに閉じる処理
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header Ribbon */}
                <div className={cn("h-3 w-full", project?.color || "bg-neutral-500")} />

                <div className="p-5 sm:p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-1 tracking-tight">{event.title}</h3>
                            <span className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-sm",
                                project?.color || "bg-neutral-500"
                            )}>
                                {project?.name || "未分類案件"}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4 text-sm text-neutral-600">
                        {/* Date & Time */}
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-medium text-neutral-800">
                                    {event.startDate} {event.startDate !== event.endDate && `〜 ${event.endDate}`}
                                </div>
                                {event.isAllDay ? (
                                    <div className="text-neutral-500">終日</div>
                                ) : (event.startTime && event.endTime) ? (
                                    <div className="text-neutral-500">{event.startTime} 〜 {event.endTime}</div>
                                ) : null}
                            </div>
                        </div>

                        {/* Location */}
                        {event.location && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                                <div className="text-neutral-800 break-words">{event.location}</div>
                            </div>
                        )}

                        {/* Description */}
                        {event.description && (
                            <div className="flex items-start gap-3">
                                <AlignLeft className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                                <div className="text-neutral-800 whitespace-pre-wrap break-words">{event.description}</div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-lg transition-colors text-sm"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
