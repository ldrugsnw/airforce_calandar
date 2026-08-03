import { Link } from 'react-router'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { getLeaveTypeLabel } from '../domain/leave'
import { getAvailableDays } from '../domain/leaveUsage'
import { useAppState } from '../store/appStateContext'

export function LeavePage() {
  const { leaveGrants, leaveUsages } = useAppState()
  const sortedLeaveGrants = [...leaveGrants].sort((first, second) =>
    second.acquiredDate.localeCompare(first.acquiredDate),
  )
  const totalAvailableDays = leaveGrants.reduce(
    (sum, leaveGrant) => sum + getAvailableDays(leaveGrant, leaveUsages),
    0,
  )

  return (
    <>
      <PageHeader
        description="획득한 휴가와 종류별 사용 가능 일수를 관리하세요."
        title="내 휴가"
      />

      <section className="mt-8 rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
        <p className="text-sm font-medium text-slate-300">총 사용 가능 휴가</p>
        <p className="mt-2 text-4xl font-bold tracking-tight">
          {totalAvailableDays}
          <span className="ml-1 text-lg font-semibold text-slate-300">일</span>
        </p>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          등록한 사용 일정을 제외하고 새로 계획할 수 있는 일수입니다.
        </p>
      </section>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-950">보유 휴가 목록</h2>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          to="/leave/new"
        >
          휴가 추가
        </Link>
      </div>

      {sortedLeaveGrants.length === 0 ? (
        <EmptyState
          description="연가, 포상휴가, 위로휴가, 청원휴가와 성과제를 기록해보세요."
          eyebrow="비어 있음"
          title="등록된 보유 휴가가 없어요"
        />
      ) : (
        <ul className="mt-4 space-y-3">
          {sortedLeaveGrants.map((leaveGrant) => (
            <li key={leaveGrant.id}>
              <Link
                aria-label={`${getLeaveTypeLabel(leaveGrant.type)} ${leaveGrant.days}일 상세 보기`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md"
                to={`/leave/${leaveGrant.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {getLeaveTypeLabel(leaveGrant.type)}
                  </span>
                  <p className="mt-3 truncate text-sm font-semibold text-slate-900">
                    {leaveGrant.reason || '사유 없음'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {leaveGrant.acquiredDate} 획득
                  </p>
                  <p className="mt-2 text-xs font-semibold text-brand-700">
                    사용 가능 {getAvailableDays(leaveGrant, leaveUsages)}일
                  </p>
                </div>
                <p
                  aria-label={`${leaveGrant.days}일`}
                  className="shrink-0 text-2xl font-bold text-slate-950"
                >
                  {leaveGrant.days}
                  <span className="ml-1 text-sm font-semibold text-slate-500">일</span>
                </p>
                </div>
                {leaveGrant.memo && (
                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">
                    {leaveGrant.memo}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
