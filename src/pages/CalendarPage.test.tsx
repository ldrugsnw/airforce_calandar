import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from '../app/App'
import type { LeaveGrant } from '../domain/leave'
import type { LeaveUsage } from '../domain/leaveUsage'
import { APP_STORAGE_KEY, saveAppState } from '../store/appStorage'

describe('월간 달력', () => {
  it('월을 이동하고 두 날짜를 이른 순서로 선택해 포함 일수를 보여준다', () => {
    render(
      <MemoryRouter initialEntries={['/calendar']}>
        <App />
      </MemoryRouter>,
    )

    const currentMonth = screen.getByRole('heading', { level: 2 }).textContent
    fireEvent.click(screen.getByRole('button', { name: '다음 달' }))
    expect(screen.getByRole('heading', { level: 2 })).not.toHaveTextContent(currentMonth ?? '')

    const dateButtons = screen
      .getAllByRole('button')
      .filter((button) => /^\d{4}년 \d{1,2}월 \d{1,2}일/.test(button.getAttribute('aria-label') ?? ''))
    const eighth = dateButtons.find((button) => button.textContent === '8')
    const tenth = dateButtons.find((button) => button.textContent === '10')

    if (!eighth || !tenth) throw new Error('테스트할 날짜 버튼을 찾지 못했습니다.')

    fireEvent.click(tenth)
    fireEvent.click(eighth)

    expect(screen.getByText(/주말과 공휴일을 포함해 총/)).toHaveTextContent('총 3일이에요.')
    expect(eighth).toHaveAttribute('aria-pressed', 'true')
    expect(tenth).toHaveAttribute('aria-pressed', 'true')
    expect(eighth).toHaveClass('bg-blue-100')
  })

  it('선택한 기간과 보유 휴가를 저장하고 달력에 종류를 표시한다', async () => {
    const leaveGrant: LeaveGrant = {
      id: 'leave-grant-1',
      type: 'annual',
      days: 10,
      acquiredDate: '2026-08-01',
      reason: '정기 연가',
      memo: '',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    }
    saveAppState({ leaveGrants: [leaveGrant], leaveUsages: [] })

    render(
      <MemoryRouter initialEntries={['/calendar']}>
        <App />
      </MemoryRouter>,
    )

    const dateButtons = screen
      .getAllByRole('button')
      .filter((button) => /^\d{4}년 \d{1,2}월 \d{1,2}일/.test(button.getAttribute('aria-label') ?? ''))
    const eighth = dateButtons.find((button) => button.textContent === '8')
    const tenth = dateButtons.find((button) => button.textContent === '10')

    if (!eighth || !tenth) throw new Error('테스트할 날짜 버튼을 찾지 못했습니다.')

    fireEvent.click(eighth)
    fireEvent.click(tenth)
    expect(screen.getByLabelText('사용할 보유 휴가')).toHaveClass(
      'h-14',
      'appearance-none',
    )
    fireEvent.change(screen.getByLabelText('사용할 보유 휴가'), {
      target: { value: leaveGrant.id },
    })
    fireEvent.click(screen.getByRole('button', { name: '휴가 일정 저장' }))

    expect(screen.getByRole('status')).toHaveTextContent('휴가 사용 일정이 저장되었습니다.')
    expect(eighth).toHaveAccessibleName(/연가/)

    fireEvent.click(eighth)

    expect(screen.getByText('등록된 휴가 일정')).toBeInTheDocument()
    expect(screen.getByText('획득 기록')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '일정 취소' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '상세 닫기' })).toBeInTheDocument()
    expect(screen.queryByLabelText('사용할 보유 휴가')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '일정 수정' }))
    expect(screen.getByLabelText('사용할 보유 휴가')).toHaveValue(leaveGrant.id)
    expect(eighth).toBeDisabled()

    const startInput = screen.getByLabelText('시작일')
    let endInput = screen.getByLabelText('종료일')
    expect(startInput).toHaveClass(
      'h-14',
      'min-w-0',
      'max-w-full',
      'calendar-date-input',
      'calendar-date-input-centered',
    )
    expect(endInput).toHaveClass(
      'h-14',
      'min-w-0',
      'max-w-full',
      'calendar-date-input',
      'calendar-date-input-centered',
    )
    expect(screen.getByLabelText('사용할 보유 휴가')).toHaveClass(
      'h-14',
      'appearance-none',
    )
    const yearMonth = (startInput as HTMLInputElement).value.slice(0, 8)

    fireEvent.change(endInput, { target: { value: `${yearMonth}11` } })
    fireEvent.click(screen.getByRole('button', { name: '수정 취소' }))
    expect(screen.getByText('등록된 휴가 일정')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '일정 수정' }))
    endInput = screen.getByLabelText('종료일')
    expect(endInput).toHaveValue(`${yearMonth}10`)

    fireEvent.change(endInput, { target: { value: `${yearMonth}07` } })
    fireEvent.click(screen.getByRole('button', { name: '변경사항 저장' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      '종료일은 시작일보다 빠를 수 없습니다.',
    )

    fireEvent.change(endInput, { target: { value: `${yearMonth}12` } })
    expect(screen.getByText('변경할 휴가 일수').parentElement).toHaveTextContent('5일')
    fireEvent.click(screen.getByRole('button', { name: '변경사항 저장' }))
    expect(screen.getByRole('status')).toHaveTextContent('휴가 사용 일정이 수정되었습니다.')

    fireEvent.click(eighth)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: '일정 취소' }))

    expect(screen.getByRole('status')).toHaveTextContent('휴가 사용 일정이 취소되었습니다.')
    expect(eighth).not.toHaveAccessibleName(/연가/)

    await waitFor(() => {
      const storedData = JSON.parse(localStorage.getItem(APP_STORAGE_KEY) ?? '{}')
      expect(storedData.leaveUsages).toHaveLength(1)
      expect(storedData.leaveUsages[0]).toMatchObject({
        leaveGrantId: leaveGrant.id,
        endDate: `${yearMonth}12`,
        canceled: true,
      })
    })
  })

  it('종류별 색상을 유지하면서 인접한 기록의 경계를 연결한다', () => {
    const leaveGrants: LeaveGrant[] = [
      {
        id: 'annual', type: 'annual', days: 3, acquiredDate: '2026-08-01', reason: '정기 연가', memo: '',
        createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z',
      },
      {
        id: 'consolation', type: 'consolation', days: 2, acquiredDate: '2026-08-01', reason: '근무 위로', memo: '',
        createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z',
      },
    ]
    const baseUsage: LeaveUsage = {
      id: 'annual-usage', leaveGrantId: 'annual', startDate: '2026-08-08', endDate: '2026-08-10',
      canceled: false, canceledAt: null, createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z',
    }
    saveAppState({
      leaveGrants,
      leaveUsages: [
        baseUsage,
        { ...baseUsage, id: 'consolation-usage', leaveGrantId: 'consolation', startDate: '2026-08-11', endDate: '2026-08-12' },
      ],
    })

    render(<MemoryRouter initialEntries={['/calendar']}><App /></MemoryRouter>)

    const annualEnd = screen.getByRole('button', { name: /2026년 8월 10일, 연가/ })
    const consolationStart = screen.getByRole('button', { name: /2026년 8월 11일, 위로휴가/ })
    expect(annualEnd).toHaveClass('bg-blue-600', 'rounded-r-none')
    expect(consolationStart).toHaveClass('bg-amber-300', 'rounded-l-none')
  })
})
