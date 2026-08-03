import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '../components/PageHeader'
import {
  createMonthGrid,
  formatCalendarDate,
  getCalendarMonth,
  getInclusiveDayCount,
  getKstToday,
  moveCalendarMonth,
  orderCalendarRange,
  type CalendarDate,
} from '../domain/calendarDate'
import { getLeaveTypeLabel, type LeaveType } from '../domain/leave'
import {
  getAvailableDays,
  validateLeaveUsage,
  type LeaveUsage,
} from '../domain/leaveUsage'
import { useAppDispatch, useAppState } from '../store/appStateContext'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const LEAVE_TYPE_STYLES: Record<LeaveType, string> = {
  annual: 'bg-blue-600 text-white',
  reward: 'bg-emerald-600 text-white',
  consolation: 'bg-amber-300 text-amber-950',
  petition: 'bg-violet-600 text-white',
  performance: 'bg-cyan-600 text-white',
  other: 'bg-slate-600 text-white',
}

export function CalendarPage() {
  const { leaveGrants, leaveUsages } = useAppState()
  const dispatch = useAppDispatch()
  const today = useMemo(() => getKstToday(), [])
  const [visibleMonth, setVisibleMonth] = useState(() => getCalendarMonth(today))
  const [startDate, setStartDate] = useState<CalendarDate | null>(null)
  const [endDate, setEndDate] = useState<CalendarDate | null>(null)
  const [selectedLeaveUsageId, setSelectedLeaveUsageId] = useState<string | null>(null)
  const [editingLeaveUsageId, setEditingLeaveUsageId] = useState<string | null>(null)
  const [selectedLeaveGrantId, setSelectedLeaveGrantId] = useState('')
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const monthGrid = useMemo(() => createMonthGrid(visibleMonth), [visibleMonth])
  const editingLeaveUsage = leaveUsages.find(
    (leaveUsage) => leaveUsage.id === editingLeaveUsageId && !leaveUsage.canceled,
  )
  const otherLeaveUsages = editingLeaveUsageId
    ? leaveUsages.filter((leaveUsage) => leaveUsage.id !== editingLeaveUsageId)
    : leaveUsages
  const availableLeaveGrants = leaveGrants.filter(
    (leaveGrant) => getAvailableDays(leaveGrant, otherLeaveUsages) > 0,
  )
  const selectedLeaveUsage = leaveUsages.find(
    (leaveUsage) => leaveUsage.id === selectedLeaveUsageId && !leaveUsage.canceled,
  )
  const selectedUsageGrant = selectedLeaveUsage
    ? leaveGrants.find(
        (leaveGrant) => leaveGrant.id === selectedLeaveUsage.leaveGrantId,
      )
    : undefined

  function selectDate(date: CalendarDate) {
    if (editingLeaveUsageId) return

    const savedUsage = getUsageForDate(date)

    if (savedUsage) {
      setSelectedLeaveUsageId(savedUsage.id)
      setEditingLeaveUsageId(null)
      setStartDate(null)
      setEndDate(null)
      setSelectedLeaveGrantId('')
      setFormMessage(null)
      return
    }

    setSelectedLeaveUsageId(null)
    setEditingLeaveUsageId(null)

    if (!startDate || endDate) {
      setStartDate(date)
      setEndDate(null)
      setSelectedLeaveGrantId('')
      setFormMessage(null)
      return
    }

    const range = orderCalendarRange(startDate, date)
    setStartDate(range.startDate)
    setEndDate(range.endDate)
    setFormMessage(null)
  }

  function getUsageForDate(date: CalendarDate) {
    return leaveUsages.find(
      (usage) => !usage.canceled && usage.startDate <= date && date <= usage.endDate,
    )
  }

  function saveLeaveUsage() {
    if (!startDate || !endDate) {
      setFormMessage({
        type: 'error',
        text: '시작일과 종료일을 모두 선택해주세요.',
      })
      return
    }

    if (endDate < startDate) {
      setFormMessage({
        type: 'error',
        text: '종료일은 시작일보다 빠를 수 없습니다.',
      })
      return
    }

    const validation = validateLeaveUsage(
      { leaveGrantId: selectedLeaveGrantId, startDate, endDate },
      leaveGrants,
      leaveUsages,
      editingLeaveUsageId ?? undefined,
    )

    if (!validation.valid) {
      setFormMessage({ type: 'error', text: validation.message })
      return
    }

    const now = new Date().toISOString()
    const leaveUsage: LeaveUsage = {
      id: editingLeaveUsage?.id ?? crypto.randomUUID(),
      leaveGrantId: selectedLeaveGrantId,
      startDate,
      endDate,
      canceled: editingLeaveUsage?.canceled ?? false,
      canceledAt: editingLeaveUsage?.canceledAt ?? null,
      createdAt: editingLeaveUsage?.createdAt ?? now,
      updatedAt: now,
    }

    dispatch({
      type: editingLeaveUsage ? 'leaveUsage/updated' : 'leaveUsage/added',
      payload: leaveUsage,
    })
    setSelectedLeaveUsageId(null)
    setEditingLeaveUsageId(null)
    setStartDate(null)
    setEndDate(null)
    setSelectedLeaveGrantId('')
    setFormMessage({
      type: 'success',
      text: editingLeaveUsage
        ? '휴가 사용 일정이 수정되었습니다.'
        : '휴가 사용 일정이 저장되었습니다.',
    })
  }

  function editSelectedLeaveUsage() {
    if (!selectedLeaveUsage) return

    setStartDate(selectedLeaveUsage.startDate)
    setEndDate(selectedLeaveUsage.endDate)
    setSelectedLeaveGrantId(selectedLeaveUsage.leaveGrantId)
    setEditingLeaveUsageId(selectedLeaveUsage.id)
    setSelectedLeaveUsageId(null)
    setFormMessage(null)
  }

  function stopEditingLeaveUsage() {
    setSelectedLeaveUsageId(editingLeaveUsageId)
    setEditingLeaveUsageId(null)
    setStartDate(null)
    setEndDate(null)
    setSelectedLeaveGrantId('')
    setFormMessage(null)
  }

  function cancelSelectedLeaveUsage() {
    if (!selectedLeaveUsage) return

    const shouldCancel = window.confirm(
      '이 휴가 일정을 취소할까요? 취소하면 사용 가능 일수가 복구됩니다.',
    )

    if (!shouldCancel) return

    dispatch({
      type: 'leaveUsage/canceled',
      payload: { id: selectedLeaveUsage.id, canceledAt: new Date().toISOString() },
    })
    setSelectedLeaveUsageId(null)
    setFormMessage({ type: 'success', text: '휴가 사용 일정이 취소되었습니다.' })
  }

  function isInSelectedRange(date: CalendarDate) {
    if (!startDate) return false
    if (!endDate) return date === startDate
    return date >= startDate && date <= endDate
  }

  return (
    <>
      <PageHeader
        description="휴가 일정을 종류별 색상으로 확인하고 계획하세요."
        title="달력"
      />
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <button
            aria-label="이전 달"
            className="flex size-12 items-center justify-center rounded-2xl text-xl text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
            onClick={() => setVisibleMonth((month) => moveCalendarMonth(month, -1))}
            type="button"
          >
            ←
          </button>
          <h2 className="text-lg font-bold text-slate-950" aria-live="polite">
            {visibleMonth.year}년 {visibleMonth.month}월
          </h2>
          <button
            aria-label="다음 달"
            className="flex size-12 items-center justify-center rounded-2xl text-xl text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
            onClick={() => setVisibleMonth((month) => moveCalendarMonth(month, 1))}
            type="button"
          >
            →
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 text-center text-xs font-semibold text-slate-400">
          {WEEKDAYS.map((weekday, index) => (
            <div
              className={index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''}
              key={weekday}
            >
              {weekday}
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-y-1">
          {monthGrid.map((calendarDay, index) => {
            if (!calendarDay) {
              return <div aria-hidden="true" className="size-10" key={`empty-${index}`} />
            }

            const usage = getUsageForDate(calendarDay.date)
            const leaveGrant = usage
              ? leaveGrants.find((grant) => grant.id === usage.leaveGrantId)
              : undefined
            const usageLabel = leaveGrant ? getLeaveTypeLabel(leaveGrant.type) : ''

            return (
              <button
                aria-label={`${formatCalendarDate(calendarDay.date)}${calendarDay.date === today ? ', 오늘' : ''}${usageLabel ? `, ${usageLabel}` : ''}`}
                aria-pressed={isInSelectedRange(calendarDay.date)}
                className={`mx-auto flex size-10 items-center justify-center rounded-xl text-sm font-medium transition ${
                  isInSelectedRange(calendarDay.date)
                    ? 'bg-blue-100 text-blue-950 shadow-sm ring-2 ring-blue-300 ring-offset-1'
                    : leaveGrant
                      ? LEAVE_TYPE_STYLES[leaveGrant.type]
                    : calendarDay.date === today
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-500'
                      : index % 7 === 0
                        ? 'text-red-500 hover:bg-red-50'
                        : index % 7 === 6
                          ? 'text-blue-500 hover:bg-blue-50'
                          : 'text-slate-700 hover:bg-slate-100'
                }`}
                disabled={Boolean(editingLeaveUsageId)}
                key={calendarDay.date}
                onClick={() => selectDate(calendarDay.date)}
                type="button"
              >
                {calendarDay.day}
              </button>
            )
          })}
        </div>

        {leaveUsages.some((usage) => !usage.canceled) && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {leaveGrants
              .filter((grant) => leaveUsages.some((usage) => !usage.canceled && usage.leaveGrantId === grant.id))
              .map((grant) => (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-600" key={grant.id}>
                  <span className={`size-3 rounded-full ${LEAVE_TYPE_STYLES[grant.type].split(' ')[0]}`} />
                  {getLeaveTypeLabel(grant.type)} · {grant.reason || '사유 없음'}
                </span>
              ))}
          </div>
        )}
      </section>

      <section className="mt-5 rounded-3xl bg-slate-50 p-5" aria-live="polite">
        <p className="text-sm font-semibold text-brand-600">
          {selectedLeaveUsage
            ? '등록된 휴가 일정'
            : editingLeaveUsageId
              ? '휴가 일정 수정'
              : '선택한 휴가 기간'}
        </p>
        {selectedLeaveUsage && selectedUsageGrant && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${LEAVE_TYPE_STYLES[selectedUsageGrant.type]}`}
                >
                  {getLeaveTypeLabel(selectedUsageGrant.type)}
                </span>
                <p className="mt-3 font-semibold text-slate-950">
                  {selectedUsageGrant.reason || '사유 없음'}
                </p>
              </div>
              <strong className="shrink-0 text-lg text-slate-950">
                {getInclusiveDayCount(
                  selectedLeaveUsage.startDate,
                  selectedLeaveUsage.endDate,
                )}
                일
              </strong>
            </div>
            <dl className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">사용 기간</dt>
                <dd className="text-right font-medium text-slate-900">
                  {formatCalendarDate(selectedLeaveUsage.startDate)} ~{' '}
                  {formatCalendarDate(selectedLeaveUsage.endDate)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">획득 기록</dt>
                <dd className="text-right font-medium text-slate-900">
                  {selectedUsageGrant.acquiredDate} · {selectedUsageGrant.days}일 획득
                </dd>
              </div>
            </dl>
            {selectedUsageGrant.memo && (
              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                {selectedUsageGrant.memo}
              </p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                className="min-h-11 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white"
                onClick={editSelectedLeaveUsage}
                type="button"
              >
                일정 수정
              </button>
              <button
                className="min-h-11 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700"
                onClick={cancelSelectedLeaveUsage}
                type="button"
              >
                일정 취소
              </button>
            </div>
            <button
              className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => setSelectedLeaveUsageId(null)}
              type="button"
            >
              상세 닫기
            </button>
          </div>
        )}
        {editingLeaveUsageId && editingLeaveUsage && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm leading-6 text-slate-600">
              시작일과 종료일을 바꾸면 주말과 공휴일을 포함한 총일수가 자동으로 계산됩니다.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-800">
                시작일
                <input
                  className="mt-2 min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 font-normal text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  max={endDate ?? undefined}
                  onChange={(event) => {
                    setStartDate(
                      event.target.value
                        ? (event.target.value as CalendarDate)
                        : null,
                    )
                    setFormMessage(null)
                  }}
                  type="date"
                  value={startDate ?? ''}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                종료일
                <input
                  className="mt-2 min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 font-normal text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  min={startDate ?? undefined}
                  onChange={(event) => {
                    setEndDate(
                      event.target.value
                        ? (event.target.value as CalendarDate)
                        : null,
                    )
                    setFormMessage(null)
                  }}
                  type="date"
                  value={endDate ?? ''}
                />
              </label>
            </div>
            <div className="mt-4 rounded-2xl bg-blue-50 p-4">
              <p className="text-xs font-semibold text-blue-700">변경할 휴가 일수</p>
              <p className="mt-1 text-2xl font-bold text-blue-950">
                {startDate && endDate && startDate <= endDate
                  ? `${getInclusiveDayCount(startDate, endDate)}일`
                  : '날짜를 확인해주세요'}
              </p>
            </div>
            <label className="mt-5 block text-sm font-semibold text-slate-800" htmlFor="edit-leave-grant">
              사용할 보유 휴가
            </label>
            <select
              className="mt-2 min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              id="edit-leave-grant"
              onChange={(event) => {
                setSelectedLeaveGrantId(event.target.value)
                setFormMessage(null)
              }}
              value={selectedLeaveGrantId}
            >
              <option value="">보유 휴가를 선택하세요</option>
              {availableLeaveGrants.map((leaveGrant) => (
                <option key={leaveGrant.id} value={leaveGrant.id}>
                  {getLeaveTypeLabel(leaveGrant.type)} · {leaveGrant.reason || '사유 없음'} · 사용 가능 {getAvailableDays(leaveGrant, otherLeaveUsages)}일
                </option>
              ))}
            </select>
            {formMessage?.type === 'error' && (
              <p className="mt-2 text-sm font-medium text-red-600" role="alert">
                {formMessage.text}
              </p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                className="min-h-12 rounded-2xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm"
                onClick={saveLeaveUsage}
                type="button"
              >
                변경사항 저장
              </button>
              <button
                className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                onClick={stopEditingLeaveUsage}
                type="button"
              >
                수정 취소
              </button>
            </div>
          </div>
        )}
        {!selectedLeaveUsage && !editingLeaveUsageId && !startDate && (
          <p className="mt-2 text-sm leading-6 text-slate-500">
            빈 날짜를 눌러 시작일과 종료일을 선택하세요. 등록된 날짜를 누르면 일정 상세를 볼 수 있어요.
          </p>
        )}
        {!editingLeaveUsageId && startDate && !endDate && (
          <div className="mt-2">
            <p className="font-semibold text-slate-900">{formatCalendarDate(startDate)}</p>
            <p className="mt-1 text-sm text-slate-500">종료일을 선택하세요. 앞선 날짜도 선택할 수 있어요.</p>
          </div>
        )}
        {!editingLeaveUsageId && startDate && endDate && (
          <div className="mt-2">
            <p className="font-semibold text-slate-900">
              {formatCalendarDate(startDate)} ~ {formatCalendarDate(endDate)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              주말과 공휴일을 포함해 총{' '}
              <strong className="text-brand-700">
                {getInclusiveDayCount(startDate, endDate)}일
              </strong>
              이에요.
            </p>
            {availableLeaveGrants.length > 0 ? (
              <div className="mt-5">
                <label className="text-sm font-semibold text-slate-800" htmlFor="leave-grant">
                  사용할 보유 휴가
                </label>
                <select
                  className="mt-2 min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  id="leave-grant"
                  onChange={(event) => {
                    setSelectedLeaveGrantId(event.target.value)
                    setFormMessage(null)
                  }}
                  value={selectedLeaveGrantId}
                >
                  <option value="">보유 휴가를 선택하세요</option>
                  {availableLeaveGrants.map((leaveGrant) => (
                    <option key={leaveGrant.id} value={leaveGrant.id}>
                      {getLeaveTypeLabel(leaveGrant.type)} · {leaveGrant.reason || '사유 없음'} · 사용 가능 {getAvailableDays(leaveGrant, leaveUsages)}일
                    </option>
                  ))}
                </select>
                {formMessage?.type === 'error' && (
                  <p className="mt-2 text-sm font-medium text-red-600" role="alert">
                    {formMessage.text}
                  </p>
                )}
                <button
                  className="mt-4 min-h-12 w-full rounded-2xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                  onClick={saveLeaveUsage}
                  type="button"
                >
                  {editingLeaveUsageId ? '휴가 일정 수정' : '휴가 일정 저장'}
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-600">
                사용할 수 있는 보유 휴가가 없습니다.{' '}
                <Link className="font-semibold text-brand-700 underline" to="/leave/new">
                  보유 휴가 추가
                </Link>
              </p>
            )}
            <button
              className="mt-4 min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
              onClick={() => {
                setStartDate(null)
                setEndDate(null)
                setSelectedLeaveGrantId('')
                setEditingLeaveUsageId(null)
                setFormMessage(null)
              }}
              type="button"
            >
              선택 초기화
            </button>
          </div>
        )}
        {!startDate && formMessage?.type === 'success' && (
          <p className="mt-2 text-sm font-semibold text-emerald-700" role="status">
            {formMessage.text}
          </p>
        )}
      </section>
    </>
  )
}
