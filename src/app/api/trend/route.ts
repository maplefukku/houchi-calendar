import { NextResponse } from 'next/server'
import type { TrendResponse } from '@/lib/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year') ?? new Date().getFullYear().toString()
  const month = searchParams.get('month') ?? (new Date().getMonth() + 1).toString()

  try {
    const res = await fetch(`${process.env.GLM_BASE_URL}chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.GLM_MODEL ?? 'glm-4.7',
        messages: [
          {
            role: 'system',
            content:
              'あなたは行動習慣のアドバイザーです。ユーザーの行動記録データを分析し、JSON形式で返してください。' +
              '必ず {"summary": "...", "suggestions": ["...", "..."]} の形式で返してください。日本語で回答してください。',
          },
          {
            role: 'user',
            content: `${year}年${month}月の行動記録を分析して、簡潔なサマリーと改善提案を返してください。`,
          },
        ],
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      return NextResponse.json(getFallbackResponse(year, month))
    }

    const json = await res.json()
    const content = json.choices?.[0]?.message?.content

    try {
      const parsed: TrendResponse = JSON.parse(content)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json({
        summary: content ?? getFallbackResponse(year, month).summary,
        suggestions: getFallbackResponse(year, month).suggestions,
      })
    }
  } catch {
    return NextResponse.json(getFallbackResponse(year, month))
  }
}

function getFallbackResponse(year: string, month: string): TrendResponse {
  return {
    summary: `${year}年${month}月のデータを分析中です。`,
    suggestions: ['毎日少しずつでも行動を続けましょう'],
  }
}
