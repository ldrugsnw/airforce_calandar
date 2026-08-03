import { isLeaveType, type LeaveGrant } from '../domain/leave'
import { isCalendarDate } from '../domain/calendarDate'
import type { LeaveUsage } from '../domain/leaveUsage'
import { initialAppState, type AppState } from './appReducer'

export const APP_STORAGE_KEY = 'airforce-calendar:data'

type StoredAppData = {
  version: 2
  leaveGrants: LeaveGrant[]
  leaveUsages: LeaveUsage[]
}

type ParsedStoredAppData = {
  version?: number
  leaveGrants?: unknown
  leaveUsages?: unknown
}

function isLeaveGrant(value: unknown): value is LeaveGrant {
  if (!value || typeof value !== 'object') {
    return false
  }

  const leaveGrant = value as Record<string, unknown>

  return (
    typeof leaveGrant.id === 'string' &&
    isLeaveType(leaveGrant.type) &&
    typeof leaveGrant.days === 'number' &&
    Number.isInteger(leaveGrant.days) &&
    leaveGrant.days > 0 &&
    typeof leaveGrant.acquiredDate === 'string' &&
    typeof leaveGrant.reason === 'string' &&
    typeof leaveGrant.memo === 'string' &&
    typeof leaveGrant.createdAt === 'string' &&
    typeof leaveGrant.updatedAt === 'string'
  )
}

function isLeaveUsage(value: unknown): value is LeaveUsage {
  if (!value || typeof value !== 'object') return false

  const usage = value as Record<string, unknown>

  return (
    typeof usage.id === 'string' &&
    typeof usage.leaveGrantId === 'string' &&
    isCalendarDate(usage.startDate) &&
    isCalendarDate(usage.endDate) &&
    usage.startDate <= usage.endDate &&
    typeof usage.canceled === 'boolean' &&
    (usage.canceledAt === null || typeof usage.canceledAt === 'string') &&
    typeof usage.createdAt === 'string' &&
    typeof usage.updatedAt === 'string'
  )
}

export function loadAppState(): AppState {
  try {
    const serializedData = localStorage.getItem(APP_STORAGE_KEY)

    if (!serializedData) {
      return initialAppState
    }

    const storedData = JSON.parse(serializedData) as ParsedStoredAppData

    if (
      !Array.isArray(storedData.leaveGrants) ||
      !storedData.leaveGrants.every(isLeaveGrant)
    ) {
      return initialAppState
    }

    const leaveGrants = storedData.leaveGrants

    if (storedData.version === 1) {
      return { leaveGrants, leaveUsages: [] }
    }

    if (
      storedData.version !== 2 ||
      !Array.isArray(storedData.leaveUsages) ||
      !storedData.leaveUsages.every(isLeaveUsage)
    ) {
      return initialAppState
    }

    const leaveUsages = storedData.leaveUsages

    if (
      leaveUsages.some(
        (usage) =>
          !leaveGrants.some(
            (leaveGrant) => leaveGrant.id === usage.leaveGrantId,
          ),
      )
    ) {
      return initialAppState
    }

    return {
      leaveGrants,
      leaveUsages,
    }
  } catch {
    return initialAppState
  }
}

export function saveAppState(state: AppState) {
  const storedData: StoredAppData = {
    version: 2,
    leaveGrants: state.leaveGrants,
    leaveUsages: state.leaveUsages,
  }

  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(storedData))
}
