import type { LeaveGrant } from '../domain/leave'

export type AppState = {
  leaveGrants: LeaveGrant[]
}

export type AppAction =
  | { type: 'leaveGrant/added'; payload: LeaveGrant }
  | { type: 'leaveGrant/updated'; payload: LeaveGrant }
  | { type: 'leaveGrant/deleted'; payload: { id: string } }

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
    default:
      return state
  }
}
