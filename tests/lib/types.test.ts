import { describe, it, expect } from 'vitest'
import type { DayStatus, Profile } from '@/types'

describe('types', () => {
  it('DayStatus has correct shape', () => {
    const day: DayStatus = {
      id: 'uuid-1',
      user_id: 'user-uuid',
      date: '2026-04-07',
      did_action: true,
      created_at: '2026-04-07T00:00:00Z',
    }
    expect(day.id).toBe('uuid-1')
    expect(day.did_action).toBe(true)
  })

  it('Profile has correct shape', () => {
    const profile: Profile = {
      id: 'user-uuid',
      email: 'test@example.com',
      notification_time: '21:00:00',
      created_at: '2026-04-07T00:00:00Z',
      updated_at: '2026-04-07T00:00:00Z',
    }
    expect(profile.email).toBe('test@example.com')
    expect(profile.notification_time).toBe('21:00:00')
  })
})
