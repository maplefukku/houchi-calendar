import { describe, it, expect } from 'vitest'
import { getStorageData } from '@/lib/storage'

describe('localStorage debug', () => {
  it('checks localStorage clear', () => {
    expect(typeof localStorage.clear).toBe('function')
  })

  it('can use getStorageData', () => {
    expect(getStorageData()).toBeDefined()
  })
})
