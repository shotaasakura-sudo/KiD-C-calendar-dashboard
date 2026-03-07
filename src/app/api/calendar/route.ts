import { NextResponse } from 'next/server'
import { ScheduleEvent } from '@/lib/types'
import { format } from 'date-fns'

// ICSファイルのテキストデータをパースする簡易関数
function parseICS(icsData: string): ScheduleEvent[] {
    const events: ScheduleEvent[] = []
    const lines = icsData.split(/\r?\n/)
    let inEvent = false
    let currentEvent: Partial<ScheduleEvent> & { rawStart?: string; rawEnd?: string; summary?: string } = {}

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        if (line === 'BEGIN:VEVENT') {
            inEvent = true
            currentEvent = {}
            continue
        }

        if (line === 'END:VEVENT') {
            inEvent = false
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

                    const hashStr = (currentEvent.summary || '').substring(0, 3)
                    const projectId = `p_${Buffer.from(hashStr).toString('hex').substring(0, 6)}`

                    events.push({
                        id: currentEvent.id || crypto.randomUUID(),
                        projectId,
                        title: currentEvent.summary || 'タイトルなし',
                        startDate: startStr,
                        endDate: endStr,
                        description: currentEvent.description,
                        location: currentEvent.location,
                        isAllDay,
                        startTime,
                        endTime,
                    })
                } catch (e) {
                    console.error('Failed to parse event dates:', currentEvent)
                }
            }
            continue
        }

        if (!inEvent) continue

        // Parse properties
        if (line.startsWith('UID:')) currentEvent.id = line.substring(4)
        else if (line.startsWith('SUMMARY:')) currentEvent.summary = line.substring(8)
        else if (line.startsWith('DESCRIPTION:')) currentEvent.description = line.substring(12).replace(/\\n/g, '\n')
        else if (line.startsWith('LOCATION:')) currentEvent.location = line.substring(9).replace(/\\,/g, ',')
        // DTSTART and DTEND can have attributes like DTSTART;VALUE=DATE:20231015
        else if (line.startsWith('DTSTART')) {
            const parts = line.split(':')
            if (parts.length > 1) currentEvent.rawStart = parts[1]
        }
        else if (line.startsWith('DTEND')) {
            const parts = line.split(':')
            if (parts.length > 1) currentEvent.rawEnd = parts[1]
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

        const res = await fetch(icalUrl, { next: { revalidate: 60 } })
        if (!res.ok) throw new Error(`Failed to fetch iCal: ${res.statusText}`)

        const icsData = await res.text()
        const events = parseICS(icsData)

        // 開始日時でソート
        events.sort((a, b) => {
            const dateA = new Date(a.startDate + (a.startTime ? `T${a.startTime}` : ''))
            const dateB = new Date(b.startDate + (b.startTime ? `T${b.startTime}` : ''))
            return dateA.getTime() - dateB.getTime()
        })

        return NextResponse.json({ events })
    } catch (error) {
        console.error('Error fetching calendar events:', error)
        return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
    }
}
