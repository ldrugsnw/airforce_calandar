import { createContext, useContext, type Dispatch } from 'react'
import type { AppAction, AppState } from './appReducer'

export const AppStateContext = createContext<AppState | null>(null)
export const AppDispatchContext = createContext<Dispatch<AppAction> | null>(null)

export function useAppState() {
  const state = useContext(AppStateContext)

  if (!state) {
    throw new Error('useAppState는 AppStateProvider 안에서 사용해야 합니다.')
  }

  return state
}

export function useAppDispatch() {
  const dispatch = useContext(AppDispatchContext)

  if (!dispatch) {
    throw new Error('useAppDispatch는 AppStateProvider 안에서 사용해야 합니다.')
  }

  return dispatch
}
