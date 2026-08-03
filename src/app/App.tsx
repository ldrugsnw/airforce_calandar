import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from './AppLayout'
import { CalendarPage } from '../pages/CalendarPage'
import { HomePage } from '../pages/HomePage'
import { LeaveCreatePage } from '../pages/LeaveCreatePage'
import { LeavePage } from '../pages/LeavePage'
import { AppStateProvider } from '../store/AppStateProvider'

export function App() {
  return (
    <AppStateProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="leave" element={<LeavePage />} />
          <Route path="leave/new" element={<LeaveCreatePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppStateProvider>
  )
}
