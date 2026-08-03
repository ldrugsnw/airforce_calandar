import { isLeaveType, type LeaveGrant } from '../domain/leave'
import { initialAppState, type AppState } from './appReducer'

export const APP_STORAGE_KEY = 'airforce-calendar:data'

type StoredAppData = {
  version: 1
  leaveGrants: LeaveGrant[]
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

export function loadAppState(): AppState {
  try {
    const serializedData = localStorage.getItem(APP_STORAGE_KEY)

    if (!serializedData) {
      return initialAppState
    }

    const storedData = JSON.parse(serializedData) as Partial<StoredAppData>

    if (
      storedData.version !== 1 ||
      !Array.isArray(storedData.leaveGrants) ||
      !storedData.leaveGrants.every(isLeaveGrant)
    ) {
      return initialAppState
    }

    return { leaveGrants: storedData.leaveGrants }
  } catch {
    return initialAppState
  }
}

export function saveAppState(state: AppState) {
  const storedData: StoredAppData = {
    version: 1,
    leaveGrants: state.leaveGrants,
  }

  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(storedData))
}
