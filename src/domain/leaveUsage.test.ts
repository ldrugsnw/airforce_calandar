import type { LeaveGrant } from './leave'
import {
  getAvailableDays,
  validateLeaveUsage,
  type LeaveUsage,
} from './leaveUsage'

describe('휴가 사용 기록 계산과 검증', () => {
  const leaveGrant: LeaveGrant = {
    id: 'leave-grant-1',
    type: 'annual',
    days: 5,
    acquiredDate: '2026-08-01',
    reason: '정기 연가',
    memo: '',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  }
  const leaveUsage: LeaveUsage = {
    id: 'leave-usage-1',
    leaveGrantId: leaveGrant.id,
    startDate: '2026-08-08',
    endDate: '2026-08-10',
    canceled: false,
    canceledAt: null,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  }

  it('취소되지 않은 사용 기록을 보유 일수에서 뺀다', () => {
    expect(getAvailableDays(leaveGrant, [leaveUsage])).toBe(2)
    expect(getAvailableDays(leaveGrant, [{ ...leaveUsage, canceled: true }])).toBe(5)
  })

  it('사용 가능한 일수를 넘으면 부족한 일수와 함께 거부한다', () => {
    expect(
      validateLeaveUsage(
        {
          leaveGrantId: leaveGrant.id,
          startDate: '2026-08-11',
          endDate: '2026-08-13',
        },
        [leaveGrant],
        [leaveUsage],
      ),
    ).toEqual({
      valid: false,
      reason: 'insufficientDays',
      message: '사용 가능한 휴가가 1일 부족합니다.',
    })
  })

  it('기존 일정과 하루라도 겹치면 거부한다', () => {
    const largerGrant = { ...leaveGrant, days: 10 }

    expect(
      validateLeaveUsage(
        {
          leaveGrantId: leaveGrant.id,
          startDate: '2026-08-10',
          endDate: '2026-08-11',
        },
        [largerGrant],
        [leaveUsage],
      ),
    ).toMatchObject({ valid: false, reason: 'overlap' })
  })

  it('잔여와 중복 조건을 모두 만족하면 저장할 수 있다', () => {
    expect(
      validateLeaveUsage(
        {
          leaveGrantId: leaveGrant.id,
          startDate: '2026-08-11',
          endDate: '2026-08-12',
        },
        [leaveGrant],
        [leaveUsage],
      ),
    ).toEqual({ valid: true })
  })

  it('수정할 때는 자기 자신의 일수와 기간을 검증 대상에서 제외한다', () => {
    expect(
      validateLeaveUsage(
        {
          leaveGrantId: leaveGrant.id,
          startDate: '2026-08-08',
          endDate: '2026-08-12',
        },
        [leaveGrant],
        [leaveUsage],
        leaveUsage.id,
      ),
    ).toEqual({ valid: true })
  })
})
