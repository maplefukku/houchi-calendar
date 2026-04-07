export interface DayStatus {
  id: string
  user_id: string
  date: string
  did_action: boolean
  created_at: string
}

export interface Profile {
  id: string
  email: string
  notification_time: string
  created_at: string
  updated_at: string
}
