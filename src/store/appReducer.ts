import type { LeaveGrant } from '../domain/leave'
import type { LeaveUsage } from '../domain/leaveUsage'

export type AppState = {
  leaveGrants: LeaveGrant[]
  leaveUsages: LeaveUsage[]
}

export type AppAction =
  | { type: 'leaveGrant/added'; payload: LeaveGrant }
  | { type: 'leaveGrant/updated'; payload: LeaveGrant }
  | { type: 'leaveGrant/deleted'; payload: { id: string } }
  | { type: 'leaveUsage/added'; payload: LeaveUsage }
  | { type: 'leaveUsage/updated'; payload: LeaveUsage }
  | { type: 'leaveUsage/canceled'; payload: { id: string; canceledAt: string } }

export const initialAppState: AppState = {
  leaveGrants: [],
  leaveUsages: [],
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'leaveGrant/added':
      return {
        ...state,
        leaveGrants: [...state.leaveGrants, action.payload],
      }
    case 'leaveGrant/updated':
      return {
        ...state,
        leaveGrants: state.leaveGrants.map((leaveGrant) =>
          leaveGrant.id === action.payload.id ? action.payload : leaveGrant,
        ),
      }
    case 'leaveGrant/deleted':
      return {
        ...state,
        leaveGrants: state.leaveGrants.filter(
          (leaveGrant) => leaveGrant.id !== action.payload.id,
        ),
      }
    case 'leaveUsage/added':
      return {
        ...state,
        leaveUsages: [...state.leaveUsages, action.payload],
      }
    case 'leaveUsage/updated':
      return {
        ...state,
        leaveUsages: state.leaveUsages.map((leaveUsage) =>
          leaveUsage.id === action.payload.id ? action.payload : leaveUsage,
        ),
      }
    case 'leaveUsage/canceled':
      return {
        ...state,
        leaveUsages: state.leaveUsages.map((leaveUsage) =>
          leaveUsage.id === action.payload.id
            ? {
                ...leaveUsage,
                canceled: true,
                canceledAt: action.payload.canceledAt,
                updatedAt: action.payload.canceledAt,
              }
            : leaveUsage,
        ),
      }
    default:
      return state
  }
}
