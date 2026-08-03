import {
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'
import { appReducer } from './appReducer'
import { loadAppState, saveAppState } from './appStorage'
import { AppDispatchContext, AppStateContext } from './appStateContext'

type AppStateProviderProps = {
  children: ReactNode
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadAppState)

  useEffect(() => {
    saveAppState(state)
  }, [state])

  return (
    <AppStateContext value={state}>
      <AppDispatchContext value={dispatch}>{children}</AppDispatchContext>
    </AppStateContext>
  )
}
