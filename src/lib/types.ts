export interface CalendarData {
  records: Record<string, 'yes' | 'no'> // key: "YYYY-MM-DD"
  settings: {
    notifyEnabled: boolean
    notifyTime: string // "HH:MM"
    theme: 'light' | 'dark' | 'system'
  }
  onboarded: boolean
}

export interface TrendResponse {
  summary: string
  suggestions: string[]
}

export const DEFAULT_CALENDAR_DATA: CalendarData = {
  records: {},
  settings: {
    notifyEnabled: false,
    notifyTime: '21:00',
    theme: 'system',
  },
  onboarded: false,
}
