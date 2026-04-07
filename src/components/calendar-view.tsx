'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import {
  getDaysInMonth,
  getFirstDayOfWeek,
  formatDateKey,
  formatJapaneseMonth,
  isToday,
} from '@/lib/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface CalendarViewProps {
  records: Record<string, 'yes' | 'no'>
  onRecordToday: () => void
  onOpenSettings: () => void
}

const WEEKDAY_HEADERS = ['月', '火', '水', '木', '金', '土', '日'] as const

export function CalendarView({
  records,
  onRecordToday,
  onOpenSettings,
}: CalendarViewProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const days = getDaysInMonth(year, month)
  const firstDayOffset = getFirstDayOfWeek(year, month)

  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1

  const todayKey = formatDateKey(now)
  const todayUnrecorded = !records[todayKey]

  // Monthly summary
  const monthYesCount = days.filter(
    (d) => records[formatDateKey(d)] === 'yes'
  ).length
  const monthNoCount = days.filter(
    (d) => records[formatDateKey(d)] === 'no'
  ).length

  function goToPrevMonth() {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-dvh flex-col"
    >
      {/* Sticky header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl">
        <h1 className="text-xl font-semibold">放置カレンダー</h1>
        <Button
          variant="ghost"
          size="icon"
          aria-label="設定"
          onClick={onOpenSettings}
        >
          <Settings className="size-5" />
        </Button>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="前の月"
            onClick={goToPrevMonth}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <span className="min-w-28 text-center text-lg font-medium">
            {formatJapaneseMonth(year, month)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="次の月"
            onClick={goToNextMonth}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday headers */}
          {WEEKDAY_HEADERS.map((label) => (
            <div
              key={label}
              className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {label}
            </div>
          ))}

          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12 w-12" />
          ))}

          {/* Day cells */}
          {days.map((date) => {
            const key = formatDateKey(date)
            const status = records[key]
            const today = isToday(date)

            return (
              <div
                key={key}
                className={`flex h-12 w-12 flex-col items-center justify-center rounded-xl transition-colors hover:bg-muted/50 ${
                  today ? 'ring-2 ring-foreground/20' : ''
                }`}
              >
                <span className="text-sm">{date.getDate()}</span>
                {status && (
                  <span
                    className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                      status === 'yes' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Summary card */}
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardContent className="flex items-center justify-around p-6">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-semibold text-red-500">
                {monthNoCount}
              </span>
              <span className="text-xs text-muted-foreground">放置した日</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-semibold text-emerald-500">
                {monthYesCount}
              </span>
              <span className="text-xs text-muted-foreground">やった日</span>
            </div>
          </CardContent>
        </Card>

        {/* Record today button */}
        {isCurrentMonth && todayUnrecorded && (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              className="h-12 w-full rounded-full text-base"
              onClick={onRecordToday}
            >
              今日を記録する
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
