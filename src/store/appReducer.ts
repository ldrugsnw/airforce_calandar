import type { LeaveGrant } from '../domain/leave'

export type AppState = {
  leaveGrants: LeaveGrant[]
}

export type AppAction = { type: 'leaveGrant/added'; payload: LeaveGrant }

export const initialAppState: AppState = {
  leaveGrants: [],
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'leaveGrant/added':
      return {
        ...state,
        leaveGrants: [...state.leaveGrants, action.payload],
      }
    default:
      return state
  }
}
