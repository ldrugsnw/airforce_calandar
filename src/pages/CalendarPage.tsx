import { useMemo, useState } from 'react'
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

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export function CalendarPage() {
  const today = useMemo(() => getKstToday(), [])
  const [visibleMonth, setVisibleMonth] = useState(() => getCalendarMonth(today))
  const [startDate, setStartDate] = useState<CalendarDate | null>(null)
  const [endDate, setEndDate] = useState<CalendarDate | null>(null)
  const monthGrid = useMemo(() => createMonthGrid(visibleMonth), [visibleMonth])

  function selectDate(date: CalendarDate) {
    if (!startDate || endDate) {
      setStartDate(date)
      setEndDate(null)
      return
    }

    const range = orderCalendarRange(startDate, date)
    setStartDate(range.startDate)
    setEndDate(range.endDate)
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
          {monthGrid.map((calendarDay, index) =>
            calendarDay ? (
              <button
                aria-label={`${formatCalendarDate(calendarDay.date)}${calendarDay.date === today ? ', 오늘' : ''}`}
                aria-pressed={isInSelectedRange(calendarDay.date)}
                className={`mx-auto flex size-10 items-center justify-center rounded-xl text-sm font-medium transition ${
                  isInSelectedRange(calendarDay.date)
                    ? 'bg-brand-600 text-white shadow-sm'
                    : calendarDay.date === today
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-500'
                      : index % 7 === 0
                        ? 'text-red-500 hover:bg-red-50'
                        : index % 7 === 6
                          ? 'text-blue-500 hover:bg-blue-50'
                          : 'text-slate-700 hover:bg-slate-100'
                }`}
                key={calendarDay.date}
                onClick={() => selectDate(calendarDay.date)}
                type="button"
              >
                {calendarDay.day}
              </button>
            ) : (
              <div aria-hidden="true" className="size-10" key={`empty-${index}`} />
            ),
          )}
        </div>
      </section>

      <section className="mt-5 rounded-3xl bg-slate-50 p-5" aria-live="polite">
        <p className="text-sm font-semibold text-brand-600">선택한 휴가 기간</p>
        {!startDate && (
          <p className="mt-2 text-sm leading-6 text-slate-500">
            시작일을 누른 뒤 종료일을 선택하세요.
          </p>
        )}
        {startDate && !endDate && (
          <div className="mt-2">
            <p className="font-semibold text-slate-900">{formatCalendarDate(startDate)}</p>
            <p className="mt-1 text-sm text-slate-500">종료일을 선택하세요. 앞선 날짜도 선택할 수 있어요.</p>
          </div>
        )}
        {startDate && endDate && (
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
            <button
              className="mt-4 min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
              onClick={() => {
                setStartDate(null)
                setEndDate(null)
              }}
              type="button"
            >
              선택 초기화
            </button>
          </div>
        )}
      </section>
    </>
  )
}
