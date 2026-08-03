import { Outlet } from 'react-router'
import { BottomNavigation } from '../components/BottomNavigation'

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="mx-auto min-h-dvh w-full max-w-lg bg-white shadow-sm">
        <main className="min-h-dvh px-5 pb-28 pt-8">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </div>
  )
}
