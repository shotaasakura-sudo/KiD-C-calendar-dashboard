import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { Project } from '@/lib/types'

export const dynamic = 'force-dynamic'

let redis: Redis | null = null;
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
}

export async function GET() {
  try {
    if (!redis) {
        return NextResponse.json({ projects: [] })
    }
    const [projects, appSettings] = await Promise.all([
        redis.get<Project[]>('settings:projects'),
        redis.get<any>('settings:app')
    ])
    return NextResponse.json({ 
        projects: projects || [],
        appSettings: appSettings || { title: 'Calendar Dashboard' }
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!redis) {
        return NextResponse.json({ error: 'Redis is not configured' }, { status: 500 })
    }
    const body = await request.json()
    const { projects, appSettings } = body

    if (projects && !Array.isArray(projects)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }
    
    if (projects) {
        await redis.set('settings:projects', projects)
    }
    if (appSettings) {
        await redis.set('settings:app', appSettings)
    }
    return NextResponse.json({ success: true, projects, appSettings })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
