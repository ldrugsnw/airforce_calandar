import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from '../app/App'
import type { LeaveGrant } from '../domain/leave'
import type { LeaveUsage } from '../domain/leaveUsage'
import { saveAppState } from '../store/appStorage'

describe('홈 다음 휴가', () => {
  it('가장 가까운 연속 일정의 D-day와 전체 구성을 보여준다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-05T15:00:00.000Z'))
    const leaveGrants: LeaveGrant[] = [
      {
        id: 'annual', type: 'annual', days: 5, acquiredDate: '2026-08-01', reason: '정기 연가', memo: '',
        createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z',
      },
      {
        id: 'consolation', type: 'consolation', days: 2, acquiredDate: '2026-08-01', reason: '주 40시간 근무', memo: '',
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

    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)

    expect(screen.getByText('다음 휴가까지 D-2')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('2026년 8월 8일 ~ 2026년 8월 12일')
    expect(screen.getByText('총 5일')).toBeInTheDocument()
    expect(screen.getByText('연가 3일 + 위로휴가 2일')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('휴가 중이면 현재 일정과 가장 가까운 다음 미래 일정을 함께 보여준다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-05T15:00:00.000Z'))
    const leaveGrant: LeaveGrant = {
      id: 'annual', type: 'annual', days: 5, acquiredDate: '2026-08-01', reason: '정기 연가', memo: '',
      createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z',
    }
    const baseUsage: LeaveUsage = {
      id: 'current', leaveGrantId: leaveGrant.id, startDate: '2026-08-05', endDate: '2026-08-07',
      canceled: false, canceledAt: null, createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z',
    }
    saveAppState({
      leaveGrants: [leaveGrant],
      leaveUsages: [
        baseUsage,
        { ...baseUsage, id: 'next', startDate: '2026-08-10', endDate: '2026-08-11' },
      ],
    })

    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)

    expect(screen.getByText('현재 휴가 중')).toBeInTheDocument()
    expect(screen.getByText('다음 휴가까지 D-4')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2026년 8월 5일 ~ 2026년 8월 7일' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2026년 8월 10일 ~ 2026년 8월 11일' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: '달력에서 일정 보기' })).toHaveLength(2)

    vi.useRealTimers()
  })
})
