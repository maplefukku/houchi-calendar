import { NextResponse } from 'next/server'
import { getStorageData, setStorageData } from '@/lib/storage'
import type { CalendarData } from '@/lib/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  if (!year || !month) {
    return NextResponse.json(
      { error: 'year and month are required' },
      { status: 400 },
    )
  }

  const prefix = `${year}-${String(Number(month)).padStart(2, '0')}`
  const data = getStorageData()
  const days = Object.entries(data.records)
    .filter(([date]) => date.startsWith(prefix))
    .map(([date, value]) => ({
      date,
      did_action: value === 'yes',
    }))

  return NextResponse.json({ days })
}

export async function POST(request: Request) {
  let body: { date?: string; did_action?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { date, did_action } = body

  if (!date || typeof did_action !== 'boolean') {
    return NextResponse.json(
      { error: 'date and did_action are required' },
      { status: 400 },
    )
  }

  const data = getStorageData()
  const updated: CalendarData = {
    ...data,
    records: {
      ...data.records,
      [date]: did_action ? 'yes' : 'no',
    },
  }
  setStorageData(updated)

  return NextResponse.json({ success: true, date, did_action })
}
