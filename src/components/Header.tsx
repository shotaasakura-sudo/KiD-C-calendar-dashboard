import { Calendar, LayoutList, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
    viewMode: 'month' | 'year'
    setViewMode: (mode: 'month' | 'year') => void
    onOpenSettings: () => void
}

export function Header({ viewMode, setViewMode, onOpenSettings }: HeaderProps) {
    return (
        <header className="bg-white border-b border-neutral-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between sticky top-0 z-10 gap-4">
            <h1 className="text-xl font-bold text-neutral-800 flex items-center gap-3 tracking-tight">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm">
                    <Calendar className="w-5 h-5" />
                </div>
                Calendar Dashboard
            </h1>

            <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200 self-stretch sm:self-auto">
                <button
                    onClick={() => setViewMode('month')}
                    className={cn(
                        "flex-1 sm:flex-none px-4 py-2 sm:py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                        viewMode === 'month'
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                    )}
                >
                    <Calendar className="w-4 h-4" />
                    月間ビュー
                </button>
                <button
                    onClick={() => setViewMode('year')}
                    className={cn(
                        "flex-1 sm:flex-none px-4 py-2 sm:py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                        viewMode === 'year'
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                    )}
                >
                    <LayoutList className="w-4 h-4" />
                    年間ビュー
                </button>
                <div className="w-px h-6 bg-neutral-300 mx-1 hidden sm:block"></div>
                <button
                    onClick={onOpenSettings}
                    className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                    title="表示案件の設定"
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>
        </header>
    )
}
