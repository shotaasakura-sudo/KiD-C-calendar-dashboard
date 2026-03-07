import { addDays, subDays, format } from 'date-fns'
import { Project, ScheduleEvent } from './types'

export const mockProjects: Project[] = [
    { id: 'p1', name: 'Webサイトリニューアル', color: 'bg-blue-500' },
    { id: 'p2', name: '新規アプリ開発', color: 'bg-emerald-500' },
    { id: 'p3', name: 'マーケティングキャンペーン', color: 'bg-amber-500' },
    { id: 'p4', name: '社内システム保守', color: 'bg-purple-500' },
]

const today = new Date()

export const mockEvents: ScheduleEvent[] = [
    {
        id: 'e1',
        projectId: 'p1',
        title: '要件定義',
        startDate: format(subDays(today, 10), 'yyyy-MM-dd'),
        endDate: format(addDays(today, -5), 'yyyy-MM-dd'),
        isAllDay: true,
        description: 'クライアントとの要件定義フェーズ。資料は共有フォルダを参照すること。',
    },
    {
        id: 'e2',
        projectId: 'p1',
        title: 'デザイン作成',
        startDate: format(subDays(today, 2), 'yyyy-MM-dd'),
        endDate: format(addDays(today, 5), 'yyyy-MM-dd'),
        isAllDay: true,
        location: 'オンライン',
    },
    {
        id: 'e3',
        projectId: 'p2',
        title: 'フロントエンド実装',
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(addDays(today, 14), 'yyyy-MM-dd'),
        isAllDay: true,
        description: 'Next.jsとTailwind CSSを用いたUI実装。',
    },
    {
        id: 'e4',
        projectId: 'p3',
        title: '広告配信設定ミーティング',
        startDate: format(addDays(today, 3), 'yyyy-MM-dd'),
        endDate: format(addDays(today, 3), 'yyyy-MM-dd'),
        isAllDay: false,
        startTime: '13:00',
        endTime: '15:00',
        location: '第2会議室',
        description: 'ターゲティングのすり合わせ',
    },
    {
        id: 'e5',
        projectId: 'p4',
        title: 'サーバーメンテナンス',
        startDate: format(addDays(today, 7), 'yyyy-MM-dd'),
        endDate: format(addDays(today, 7), 'yyyy-MM-dd'),
        isAllDay: false,
        startTime: '02:00',
        endTime: '05:00',
        description: 'DBのマイグレーションとダウンタイムの発生',
    },
]
