import { NextResponse } from 'next/server'
import { ScheduleEvent, Project } from '@/lib/types'
import { format } from 'date-fns'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

let redis: Redis | null = null;
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
}

// ICSファイルのテキストデータをパースする簡易関数
function parseICS(icsData: string, activeProjects: Project[]): ScheduleEvent[] {
    const events: ScheduleEvent[] = []
    const lines = icsData.split(/\r?\n/)
    let inEvent = false
    let currentEvent: Partial<ScheduleEvent> & { rawStart?: string; rawEnd?: string; summary?: string; description?: string } = {}

    // 説明文が複数行になる場合（DESCRIPTION: の後に空白で続くケース）に対応するため
    let lastKey = ''

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i]
        
        // RFC5545 複数行の継続（行頭がスペースかタブ）
        if (rawLine.startsWith(' ') || rawLine.startsWith('\t')) {
            if (inEvent && lastKey === 'DESCRIPTION' && currentEvent.description !== undefined) {
                currentEvent.description += rawLine.substring(1)
            }
            continue;
        }

        const line = rawLine

        if (line === 'BEGIN:VEVENT') {
            inEvent = true
            currentEvent = {}
            lastKey = ''
            continue
        }

        if (line === 'END:VEVENT') {
            inEvent = false
            lastKey = ''
            if (currentEvent.rawStart) {
                // Parse dates and build event object
                try {
                    const isAllDay = currentEvent.rawStart.length <= 8 // e.g. "20231015"

                    const pStart = parseIcsDate(currentEvent.rawStart)
                    const pEnd = currentEvent.rawEnd ? parseIcsDate(currentEvent.rawEnd) : pStart

                    const startStr = format(pStart, 'yyyy-MM-dd')
                    let endStr = format(pEnd, 'yyyy-MM-dd')

                    if (isAllDay) {
                        endStr = format(new Date(pEnd.getTime() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
                    }

                    let startTime, endTime
                    if (!isAllDay) {
                        startTime = format(pStart, 'HH:mm')
                        endTime = format(pEnd, 'HH:mm')
                    }

                    let rawTitle = currentEvent.summary || 'タイトルなし'
                    // ICS files often escape newlines and commas
                    const fullDesc = (currentEvent.description || '').replace(/\\n/g, '\n').replace(/\\,/g, ',')
                    
                    console.log(`--- Parsing Event: ${rawTitle} ---`)
                    console.log(`Raw Description: ${currentEvent.description}`)
                    console.log(`Cleaned Description: ${fullDesc}`)

                    let matchedProjects: Project[] = []
                    if (fullDesc) {
                        const tagMatches = [...fullDesc.matchAll(/#([^\s　#,。、\r\n]+)/g)]
                        const extractedNames = tagMatches.map(m => m[1].trim())
                        if (extractedNames.length > 0) {
                            console.log(`Found Hashtags: ${extractedNames.join(', ')}`)
                            matchedProjects = activeProjects.filter(p => extractedNames.includes(p.name))
                            console.log(`Matched Projects in Redis:`, matchedProjects.map(p => p.name).join(', ') || 'None')
                        } else {
                            console.log(`No hashtag matched in description.`)
                        }
                    }

                    // 案件リストに合致する予定のみ返す
                    if (matchedProjects.length > 0) {
                        events.push({
                            id: currentEvent.id || crypto.randomUUID(),
                            projectIds: matchedProjects.map(p => p.id),
                            title: rawTitle,
                            startDate: startStr,
                            endDate: endStr,
                            description: fullDesc,
                            location: currentEvent.location,
                            isAllDay,
                            startTime,
                            endTime,
                        })
                    }
                } catch (e) {
                    console.error('Failed to parse event dates:', currentEvent)
                }
            }
            continue
        }

        if (!inEvent) continue

        // Parse properties
        if (line.startsWith('UID:')) { currentEvent.id = line.substring(4); lastKey = 'UID' }
        else if (line.startsWith('SUMMARY:')) { currentEvent.summary = line.substring(8); lastKey = 'SUMMARY' }
        else if (line.startsWith('DESCRIPTION:')) { currentEvent.description = line.substring(12); lastKey = 'DESCRIPTION' }
        else if (line.startsWith('LOCATION:')) { currentEvent.location = line.substring(9).replace(/\\,/g, ','); lastKey = 'LOCATION' }
        else if (line.startsWith('DTSTART')) {
            const parts = line.split(':')
            if (parts.length > 1) currentEvent.rawStart = parts[1]
            lastKey = 'DTSTART'
        }
        else if (line.startsWith('DTEND')) {
            const parts = line.split(':')
            if (parts.length > 1) currentEvent.rawEnd = parts[1]
            lastKey = 'DTEND'
        } else {
            lastKey = ''
        }
    }

    return events
}

function parseIcsDate(dateStr: string): Date {
    // "20231015" or "20231015T103000Z"
    const year = parseInt(dateStr.substring(0, 4), 10)
    const month = parseInt(dateStr.substring(4, 6), 10) - 1
    const day = parseInt(dateStr.substring(6, 8), 10)

    if (dateStr.length > 8 && dateStr.includes('T')) {
        const timePart = dateStr.split('T')[1]
        const hour = parseInt(timePart.substring(0, 2), 10)
        const min = parseInt(timePart.substring(2, 4), 10)
        const sec = parseInt(timePart.substring(4, 6), 10)
        // Note: this simplistic approach assumes Z (UTC) or local time interchangeably.
        // For accurate timezone handling, more complex parsing is needed, but this works for a simple local display.
        if (dateStr.endsWith('Z')) {
            return new Date(Date.UTC(year, month, day, hour, min, sec))
        } else {
            return new Date(year, month, day, hour, min, sec)
        }
    }

    return new Date(year, month, day)
}

export async function GET() {
    try {
        const icalUrl = process.env.GOOGLE_ICAL_URL

        if (!icalUrl) {
            return NextResponse.json(
                { error: 'Google Calendar iCal URL is not set in environment variables.' },
                { status: 500 }
            )
        }

        // KVからプロジェクト（案件リスト）を取得
        let activeProjects: Project[] = []
        let appSettings = null
        if (redis) {
            const [projects, settings] = await Promise.all([
                redis.get<Project[]>('settings:projects'),
                redis.get<any>('settings:app')
            ])
            if (projects && Array.isArray(projects)) {
                activeProjects = projects
            }
            appSettings = settings || { title: 'Calendar Dashboard' }
        }

        const res = await fetch(icalUrl, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to fetch iCal: ${res.statusText}`)

        const icsData = await res.text()
        const events = parseICS(icsData, activeProjects)

        // 開始日時でソート
        events.sort((a, b) => {
            const dateA = new Date(a.startDate + (a.startTime ? `T${a.startTime}` : ''))
            const dateB = new Date(b.startDate + (b.startTime ? `T${b.startTime}` : ''))
            return dateA.getTime() - dateB.getTime()
        })

        return NextResponse.json({ events, projects: activeProjects, appSettings })
    } catch (error) {
        console.error('Error fetching calendar events:', error)
        return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
    }
}
