import type { LeaveUsage } from './leaveUsage'
import { validateOuting, type Outing } from './outing'

describe('외출 검증', () => {
  const outing: Outing = {
    id: 'outing-1',
    date: '2026-08-12',
    reason: '개인 용무',
    canceled: false,
    canceledAt: null,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  }
  const leaveUsage: LeaveUsage = {
    id: 'leave-usage-1',
    leaveGrantId: 'leave-grant-1',
    startDate: '2026-08-11',
    endDate: '2026-08-13',
    canceled: false,
    canceledAt: null,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  }

  it('날짜와 사유가 있고 충돌 일정이 없으면 등록할 수 있다', () => {
    expect(
      validateOuting(
        { date: '2026-08-14', reason: '병원 진료' },
        [outing],
        [leaveUsage],
      ),
    ).toEqual({ valid: true })
  })

  it('사유가 공백이면 등록을 거부한다', () => {
    expect(
      validateOuting({ date: '2026-08-14', reason: '  ' }, [], []),
    ).toMatchObject({ valid: false, reason: 'reasonRequired' })
  })

  it('같은 날짜에는 외출을 한 건만 허용한다', () => {
    expect(
      validateOuting(
        { date: outing.date, reason: '병원 진료' },
        [outing],
        [],
      ),
    ).toEqual({
      valid: false,
      reason: 'duplicate',
      message: '2026-08-12에 이미 외출이 등록되어 있습니다.',
    })
  })

  it('휴가 기간에 포함된 날짜의 외출 등록을 거부한다', () => {
    expect(
      validateOuting(
        { date: '2026-08-12', reason: '병원 진료' },
        [],
        [leaveUsage],
      ),
    ).toEqual({
      valid: false,
      reason: 'leaveOverlap',
      message: '2026-08-12에 휴가가 등록되어 있어 외출을 저장할 수 없습니다.',
    })
  })

  it('취소된 외출과 휴가는 충돌 대상으로 보지 않는다', () => {
    expect(
      validateOuting(
        { date: '2026-08-12', reason: '병원 진료' },
        [{ ...outing, canceled: true }],
        [{ ...leaveUsage, canceled: true }],
      ),
    ).toEqual({ valid: true })
  })
})
