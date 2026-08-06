import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from '../app/App'
import type { LeaveGrant } from '../domain/leave'
import type { LeaveUsage } from '../domain/leaveUsage'
import { saveAppState } from '../store/appStorage'

describe('보유 휴가 목록 정리', () => {
  const leaveGrants: LeaveGrant[] = [
    {
      id: 'annual-old', type: 'annual', days: 5, acquiredDate: '2026-01-01', reason: '가용 연가', memo: '',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'annual-new', type: 'annual', days: 3, acquiredDate: '2026-03-01', reason: '신규 연가', memo: '',
      createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-01T00:00:00.000Z',
    },
    {
      id: 'annual-completed', type: 'annual', days: 2, acquiredDate: '2025-01-01', reason: '완료 연가', memo: '',
      createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'reward', type: 'reward', days: 4, acquiredDate: '2026-02-01', reason: '우수 포상', memo: '',
      createdAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z',
    },
  ]
  const baseUsage: LeaveUsage = {
    id: 'completed-annual',
    leaveGrantId: 'annual-completed',
    startDate: '2026-07-01',
    endDate: '2026-07-02',
    canceled: false,
    canceledAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-05T15:00:00.000Z'))
    saveAppState({
      leaveGrants,
      leaveUsages: [
        baseUsage,
        { ...baseUsage, id: 'reward-completed', leaveGrantId: 'reward', startDate: '2026-07-01', endDate: '2026-07-01' },
        { ...baseUsage, id: 'reward-current', leaveGrantId: 'reward', startDate: '2026-08-06', endDate: '2026-08-06' },
        { ...baseUsage, id: 'reward-scheduled', leaveGrantId: 'reward', startDate: '2026-08-10', endDate: '2026-08-10' },
      ],
      outings: [],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('전체 요약에서 사용 가능, 사용 완료와 원본 총 휴가를 전환한다', () => {
    render(<MemoryRouter initialEntries={['/leave']}><App /></MemoryRouter>)
    const summary = screen.getByRole('region', { name: '내 휴가 전체 요약' })

    expect(summary).toHaveTextContent('사용 가능9일')
    fireEvent.click(within(summary).getByRole('button', { name: '사용 완료' }))
    expect(summary).toHaveTextContent('사용 완료3일')
    fireEvent.click(within(summary).getByRole('button', { name: '총 휴가' }))
    expect(summary).toHaveTextContent('총 휴가14일')
  })

  it('추천순으로 종류를 묶고 사용 가능, 오래된 획득일 순서로 배치한다', () => {
    render(<MemoryRouter initialEntries={['/leave']}><App /></MemoryRouter>)

    expect(screen.getByLabelText('목록 정렬')).toHaveValue('recommended')
    expect(getCardNames()).toEqual([
      '연가 5일 상세 보기',
      '연가 3일 상세 보기',
      '연가 2일 상세 보기',
      '포상휴가 4일 상세 보기',
    ])
    expect(screen.getByRole('heading', { name: '연가', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '포상휴가', level: 3 })).toBeInTheDocument()
  })

  it('단일 select에서 다섯 가지 정렬 기준을 적용한다', () => {
    render(<MemoryRouter initialEntries={['/leave']}><App /></MemoryRouter>)
    const select = screen.getByLabelText('목록 정렬')

    expect(within(select).getAllByRole('option').map((option) => option.textContent)).toEqual([
      '기본순',
      '최근 획득순',
      '오래된 획득순',
      '이름순',
      '사용 가능 일수순',
    ])

    fireEvent.change(select, { target: { value: 'newest' } })
    expect(getCardNames()).toEqual([
      '연가 3일 상세 보기',
      '포상휴가 4일 상세 보기',
      '연가 5일 상세 보기',
      '연가 2일 상세 보기',
    ])

    fireEvent.change(select, { target: { value: 'oldest' } })
    expect(getCardNames()).toEqual([
      '연가 2일 상세 보기',
      '연가 5일 상세 보기',
      '포상휴가 4일 상세 보기',
      '연가 3일 상세 보기',
    ])

    fireEvent.change(select, { target: { value: 'name' } })
    expect(getCardNames()).toEqual([
      '연가 5일 상세 보기',
      '연가 3일 상세 보기',
      '연가 2일 상세 보기',
      '포상휴가 4일 상세 보기',
    ])

    fireEvent.change(select, { target: { value: 'available' } })
    expect(getCardNames()).toEqual([
      '연가 5일 상세 보기',
      '연가 3일 상세 보기',
      '포상휴가 4일 상세 보기',
      '연가 2일 상세 보기',
    ])
  })

  it('휴가 종류를 선택해 해당 종류의 카드만 본다', () => {
    render(<MemoryRouter initialEntries={['/leave']}><App /></MemoryRouter>)
    const typeFilter = screen.getByLabelText('휴가 종류')

    expect(typeFilter).toHaveValue('all')
    expect(within(typeFilter).getAllByRole('option').map((option) => option.textContent)).toEqual([
      '전체 휴가',
      '연가',
      '포상휴가',
      '위로휴가',
      '공가',
      '청원휴가',
      '성과제',
      '기타',
    ])

    fireEvent.change(typeFilter, { target: { value: 'annual' } })
    expect(getCardNames()).toEqual([
      '연가 5일 상세 보기',
      '연가 3일 상세 보기',
      '연가 2일 상세 보기',
    ])

    fireEvent.change(typeFilter, { target: { value: 'reward' } })
    expect(getCardNames()).toEqual(['포상휴가 4일 상세 보기'])

    fireEvent.change(typeFilter, { target: { value: 'official' } })
    expect(screen.getByText('선택한 종류의 휴가가 없어요')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /상세 보기$/ })).not.toBeInTheDocument()
  })

  it('종류별 색을 적용하고 전부 사용한 카드를 연한 색과 배지로 구분한다', () => {
    render(<MemoryRouter initialEntries={['/leave']}><App /></MemoryRouter>)
    const availableAnnual = screen.getByRole('link', { name: '연가 5일 상세 보기' })
    const reward = screen.getByRole('link', { name: '포상휴가 4일 상세 보기' })
    const completedAnnual = screen.getByRole('link', { name: '연가 2일 상세 보기' })

    expect(availableAnnual).toHaveClass('border-blue-300', 'bg-blue-50')
    expect(reward).toHaveClass('border-red-300', 'bg-red-50')
    expect(completedAnnual).toHaveClass('border-blue-100', 'bg-blue-50/40')
    expect(within(completedAnnual).getAllByText('사용 완료')).toHaveLength(2)
  })
})

function getCardNames() {
  return screen
    .getAllByRole('link', { name: /상세 보기$/ })
    .map((link) => link.getAttribute('aria-label'))
}
