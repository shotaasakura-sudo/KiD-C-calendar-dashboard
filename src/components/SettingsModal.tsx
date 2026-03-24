import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Save } from 'lucide-react'
import { Project, AppSettings } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    onSaveSuccess: () => void
}

const COLOR_OPTIONS = [
    { name: 'ブルー', class: 'bg-blue-500' },
    { name: 'レッド', class: 'bg-red-500' },
    { name: 'グリーン', class: 'bg-emerald-500' },
    { name: 'イエロー', class: 'bg-amber-500' },
    { name: 'パープル', class: 'bg-purple-500' },
    { name: 'ピンク', class: 'bg-pink-500' },
    { name: 'シアン', class: 'bg-cyan-500' },
    { name: 'グレー', class: 'bg-neutral-500' },
]

export function SettingsModal({ isOpen, onClose, onSaveSuccess }: SettingsModalProps) {
    const [projects, setProjects] = useState<Project[]>([])
    const [appTitle, setAppTitle] = useState('Calendar Dashboard')
    const [appIconUrl, setAppIconUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchSettings()
        }
    }, [isOpen])

    const fetchSettings = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const res = await fetch('/api/settings')
            const data = await res.json()
            if (data.projects) {
                setProjects(data.projects)
            }
            if (data.appSettings) {
                setAppTitle(data.appSettings.title || 'Calendar Dashboard')
                setAppIconUrl(data.appSettings.iconUrl || '')
            }
        } catch (err: any) {
            setError('設定の読み込みに失敗しました')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        // Validation: Empty names
        if (projects.some(p => !p.name.trim())) {
            setError('案件名が空の項目があります。')
            return
        }

        try {
            setIsSaving(true)
            setError(null)
            
            // # を取り除いて保存する
            const cleanProjects = projects.map(p => ({
                ...p,
                name: p.name.replace(/^#/, '').trim()
            }))

            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    projects: cleanProjects,
                    appSettings: { title: appTitle.trim(), iconUrl: appIconUrl }
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || '保存に失敗しました')

            onSaveSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const addProject = () => {
        const newId = `p_${Math.random().toString(36).substring(2, 9)}`
        setProjects([...projects, { id: newId, name: '', color: 'bg-blue-500' }])
    }

    const removeProject = (id: string) => {
        setProjects(projects.filter(p => p.id !== id))
    }

    const updateProject = (id: string, field: keyof Project, value: string) => {
        setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p))
    }

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 1024 * 1024) {
                setError('画像サイズは1MB以下にしてください。')
                return
            }
            const reader = new FileReader()
            reader.onloadend = () => {
                setAppIconUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-neutral-100">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-neutral-800">表示案件のカスタマイズ</h2>
                        <p className="text-sm text-neutral-500 mt-1">ダッシュボードに表示する案件とテーマカラーを設定します。（共有設定）</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-neutral-50 hover:bg-neutral-100 rounded-full transition-colors self-start"
                    >
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-neutral-50/50">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-neutral-700 mb-3 tracking-tight">共通設定（タイトル・アイコン）</h3>
                        <div className="space-y-4 bg-white p-4 sm:p-5 rounded-xl border border-neutral-200 shadow-sm">
                             <div>
                                 <label className="block text-xs font-semibold text-neutral-500 mb-1.5">タイトル</label>
                                 <input type="text" value={appTitle} onChange={e => setAppTitle(e.target.value)} placeholder="例: My Calendar" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
                             </div>
                             <div>
                                 <label className="block text-xs font-semibold text-neutral-500 mb-1.5">アイコン画像 (最大1MB)</label>
                                 <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                     {appIconUrl ? <img src={appIconUrl} alt="icon" className="w-12 h-12 object-cover rounded-xl shadow-sm border border-neutral-200" /> : <div className="w-12 h-12 bg-neutral-100 border border-neutral-300 rounded-xl flex items-center justify-center text-neutral-400 text-xs text-center p-1 leading-tight">画像なし</div>}
                                     <input type="file" accept="image/*" onChange={handleIconChange} className="text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 w-full" />
                                     {appIconUrl && <button onClick={() => setAppIconUrl('')} className="text-xs text-red-500 hover:text-red-600 font-medium whitespace-nowrap shrink-0 px-2 py-1 rounded hover:bg-red-50">クリア</button>}
                                 </div>
                             </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <h3 className="text-sm font-bold text-neutral-700 tracking-tight">案件・タグの設定</h3>
                    </div>
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="text-center py-10 text-neutral-500">読み込み中...</div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-10 text-neutral-500 bg-white border border-neutral-200 rounded-xl border-dashed">
                                設定されている案件がありません。「案件を追加」ボタンから追加してください。
                            </div>
                        ) : (
                            projects.map((project, index) => (
                                <div key={project.id} className="flex gap-3 items-center bg-white p-3 rounded-xl border border-neutral-200 shadow-sm transition-all hover:shadow-md group">
                                    <div className="font-mono text-xs text-neutral-400 w-4 text-right shrink-0">{index + 1}</div>
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 font-medium">#</div>
                                        <input
                                            type="text"
                                            value={project.name}
                                            onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                                            placeholder="案件名 (例: Website)"
                                            className="w-full pl-7 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                                        />
                                    </div>
                                    <div className="shrink-0 relative">
                                        <select
                                            value={project.color}
                                            onChange={(e) => updateProject(project.id, 'color', e.target.value)}
                                            className="pl-8 pr-8 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none"
                                        >
                                            {COLOR_OPTIONS.map(c => (
                                                <option key={c.class} value={c.class}>{c.name}</option>
                                            ))}
                                        </select>
                                        <div className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full pointer-events-none", project.color)} />
                                    </div>
                                    <button
                                        onClick={() => removeProject(project.id)}
                                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="削除"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                        
                        <button
                            onClick={addProject}
                            className="w-full py-3 mt-4 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-500 font-medium text-sm flex items-center justify-center gap-2 hover:bg-neutral-50 hover:text-neutral-700 hover:border-neutral-400 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            案件を追加
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6 border-t border-neutral-200 bg-white flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 transition-colors"
                        disabled={isSaving}
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={cn(
                            "px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm",
                            isSaving && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>保存中...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>設定を保存</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
