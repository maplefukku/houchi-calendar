"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useCalendarData } from "@/lib/storage"
import { formatDateKey } from "@/lib/calendar"
import { Welcome } from "@/components/welcome"
import { CalendarView } from "@/components/calendar-view"
import { RecordSheet } from "@/components/record-sheet"
import { SettingsSheet } from "@/components/settings-sheet"
import { DEFAULT_CALENDAR_DATA } from "@/lib/types"
import { setStorageData } from "@/lib/storage"

export default function Home() {
  const { data, setRecord, setSettings, setOnboarded } = useCalendarData()
  const { setTheme } = useTheme()
  const [recordSheetOpen, setRecordSheetOpen] = useState(false)
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync theme setting
  useEffect(() => {
    if (mounted) {
      setTheme(data.settings.theme)
    }
  }, [data.settings.theme, setTheme, mounted])

  // Auto-open record sheet if today is unrecorded (after onboarding)
  useEffect(() => {
    if (mounted && data.onboarded) {
      const todayKey = formatDateKey(new Date())
      if (!data.records[todayKey]) {
        setRecordSheetOpen(true)
      }
    }
  }, [mounted, data.onboarded]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) {
    return null
  }

  if (!data.onboarded) {
    return (
      <Welcome
        onStart={() => {
          setOnboarded(true)
        }}
      />
    )
  }

  return (
    <>
      <CalendarView
        records={data.records}
        onRecordToday={() => setRecordSheetOpen(true)}
        onOpenSettings={() => setSettingsSheetOpen(true)}
      />

      <RecordSheet
        open={recordSheetOpen}
        onOpenChange={setRecordSheetOpen}
        date={new Date()}
        onRecord={(value) => {
          const todayKey = formatDateKey(new Date())
          setRecord(todayKey, value)
          setRecordSheetOpen(false)
        }}
      />

      <SettingsSheet
        open={settingsSheetOpen}
        onOpenChange={setSettingsSheetOpen}
        settings={data.settings}
        onSettingsChange={(newSettings) => {
          setSettings(newSettings)
        }}
        onDeleteData={() => {
          setStorageData(DEFAULT_CALENDAR_DATA)
        }}
      />
    </>
  )
}
