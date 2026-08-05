import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { SubPageHeader } from '../components/SubPageHeader'
import { getKstToday } from '../domain/calendarDate'
import { getLeaveTypeLabel } from '../domain/leave'
import { getLeaveGrantSummary } from '../domain/leaveUsage'
import { useAppDispatch, useAppState } from '../store/appStateContext'

export function LeaveDetailPage() {
  const { leaveGrantId } = useParams()
  const { leaveGrants, leaveUsages } = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const leaveGrant = leaveGrants.find((item) => item.id === leaveGrantId)

  if (!leaveGrant) {
    return <Navigate to="/leave" replace />
  }

  const currentLeaveGrant = leaveGrant
  const summary = getLeaveGrantSummary(
    currentLeaveGrant,
    leaveUsages,
    getKstToday(),
  )

  function handleDelete() {
    const confirmed = window.confirm(
      `${getLeaveTypeLabel(currentLeaveGrant.type)} ${currentLeaveGrant.days}일 기록을 삭제할까요?`,
    )

    if (!confirmed) {
      return
    }

    dispatch({
      type: 'leaveGrant/deleted',
      payload: { id: currentLeaveGrant.id },
    })
    navigate('/leave', { replace: true })
  }

  return (
    <div>
      <SubPageHeader
        backTo="/leave"
        description="획득한 휴가의 원본 정보를 확인합니다."
        eyebrow="내 휴가"
        title="보유 휴가 상세"
      />

      <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-950 p-6 text-white">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
            {getLeaveTypeLabel(currentLeaveGrant.type)}
          </span>
          <p className="mt-4 text-4xl font-bold tracking-tight">
            {currentLeaveGrant.days}
            <span className="ml-1 text-lg font-semibold text-slate-300">일</span>
          </p>
        </div>
        <dl className="divide-y divide-slate-100 px-6">
          <DetailRow label="획득 날짜" value={currentLeaveGrant.acquiredDate} />
          <DetailRow
            label="획득 사유"
            value={currentLeaveGrant.reason || '사유 없음'}
          />
          <DetailRow label="메모" value={currentLeaveGrant.memo || '메모 없음'} />
        </dl>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-950">휴가 일수 현황</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <SummaryCard label="총 획득" value={summary.totalDays} />
          <SummaryCard label="사용 완료" value={summary.completedDays} />
          <SummaryCard label="사용 예정" value={summary.scheduledDays} />
          <SummaryCard label="사용 가능" value={summary.availableDays} emphasized />
        </dl>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          className="min-h-12 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          onClick={handleDelete}
          type="button"
        >
          삭제
        </button>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          to={`/leave/${currentLeaveGrant.id}/edit`}
        >
          수정
        </Link>
      </div>

      <p className="mt-4 text-center text-xs leading-5 text-slate-400">
        현재는 사용 기록이 없으므로 삭제할 수 있습니다.
      </p>
    </div>
  )
}

type SummaryCardProps = {
  emphasized?: boolean
  label: string
  value: number
}

function SummaryCard({ emphasized = false, label, value }: SummaryCardProps) {
  return (
    <div className={emphasized ? 'rounded-2xl bg-brand-50 p-4' : 'rounded-2xl bg-slate-50 p-4'}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className={`mt-1 text-xl font-bold ${emphasized ? 'text-brand-700' : 'text-slate-950'}`}>
        {value}일
      </dd>
    </div>
  )
}

type DetailRowProps = {
  label: string
  value: string
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-4 py-5 text-sm">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="break-words font-semibold leading-6 text-slate-900">{value}</dd>
    </div>
  )
}
