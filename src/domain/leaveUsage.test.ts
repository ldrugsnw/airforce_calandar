import type { LeaveGrant } from './leave'
import {
  createContinuousLeaveSchedules,
  getAvailableDays,
  getContinuousLeaveScheduleForUsage,
  getLeaveGrantSummary,
  getCurrentAndNextLeaveSchedules,
  getLeaveScheduleDday,
  getLeaveUsageStatus,
  getLeaveUsageStatusLabel,
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

  it('KST 오늘과 기간을 비교해 예정, 휴가 중, 완료 상태를 계산한다', () => {
    expect(getLeaveUsageStatus(leaveUsage, '2026-08-07')).toBe('scheduled')
    expect(getLeaveUsageStatus(leaveUsage, '2026-08-08')).toBe('inProgress')
    expect(getLeaveUsageStatus(leaveUsage, '2026-08-10')).toBe('inProgress')
    expect(getLeaveUsageStatus(leaveUsage, '2026-08-11')).toBe('completed')
    expect(getLeaveUsageStatusLabel('scheduled')).toBe('사용 예정')
    expect(getLeaveUsageStatusLabel('inProgress')).toBe('휴가 중')
    expect(getLeaveUsageStatusLabel('completed')).toBe('사용 완료')
  })

  it('나누어 쓴 기록을 상태별로 합산하고 전체 사용 일수는 한 번만 차감한다', () => {
    const usages: LeaveUsage[] = [
      { ...leaveUsage, id: 'completed', startDate: '2026-08-01', endDate: '2026-08-02' },
      { ...leaveUsage, id: 'in-progress', startDate: '2026-08-05', endDate: '2026-08-05' },
      { ...leaveUsage, id: 'scheduled', startDate: '2026-08-10', endDate: '2026-08-10' },
      { ...leaveUsage, id: 'canceled', startDate: '2026-08-12', endDate: '2026-08-12', canceled: true },
    ]

    expect(getLeaveGrantSummary(leaveGrant, usages, '2026-08-05')).toEqual({
      totalDays: 5,
      completedDays: 2,
      inProgressDays: 1,
      scheduledDays: 1,
      availableDays: 1,
    })
  })

  it('총 획득 일수는 사용 가능과 모든 사용 상태의 합계와 일치한다', () => {
    const summary = getLeaveGrantSummary(
      leaveGrant,
      [
        { ...leaveUsage, id: 'completed', startDate: '2026-08-01', endDate: '2026-08-01' },
        { ...leaveUsage, id: 'in-progress', startDate: '2026-08-05', endDate: '2026-08-05' },
        { ...leaveUsage, id: 'scheduled', startDate: '2026-08-10', endDate: '2026-08-11' },
      ],
      '2026-08-05',
    )

    expect(
      summary.availableDays +
        summary.scheduledDays +
        summary.inProgressDays +
        summary.completedDays,
    ).toBe(summary.totalDays)
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

  it('여러 기존 일정과 이어서 겹치면 전체 중복 기간을 안내한다', () => {
    const largerGrant = { ...leaveGrant, days: 20 }
    const usages: LeaveUsage[] = [
      { ...leaveUsage, id: 'reward', startDate: '2026-08-12', endDate: '2026-08-12' },
      { ...leaveUsage, id: 'consolation-1', startDate: '2026-08-13', endDate: '2026-08-13' },
      { ...leaveUsage, id: 'consolation-2', startDate: '2026-08-14', endDate: '2026-08-14' },
    ]

    expect(
      validateLeaveUsage(
        {
          leaveGrantId: largerGrant.id,
          startDate: '2026-08-11',
          endDate: '2026-08-15',
        },
        [largerGrant],
        usages,
      ),
    ).toEqual({
      valid: false,
      reason: 'overlap',
      message: '이미 등록된 2026-08-12 ~ 2026-08-14 일정과 겹칩니다.',
    })
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

  it('날짜가 바로 이어지는 기록만 연속 일정으로 묶고 종류별 구성을 계산한다', () => {
    const consolationGrant: LeaveGrant = {
      ...leaveGrant,
      id: 'leave-grant-2',
      type: 'consolation',
      days: 3,
    }
    const schedules = createContinuousLeaveSchedules(
      [
        { ...leaveUsage, id: 'second', leaveGrantId: consolationGrant.id, startDate: '2026-08-11', endDate: '2026-08-12' },
        leaveUsage,
        { ...leaveUsage, id: 'separate', startDate: '2026-08-14', endDate: '2026-08-14' },
        { ...leaveUsage, id: 'canceled', startDate: '2026-08-13', endDate: '2026-08-13', canceled: true },
      ],
      [leaveGrant, consolationGrant],
    )

    expect(schedules).toHaveLength(2)
    expect(schedules[0]).toMatchObject({
      startDate: '2026-08-08',
      endDate: '2026-08-12',
      totalDays: 5,
      composition: [
        { type: 'annual', days: 3 },
        { type: 'consolation', days: 2 },
      ],
    })
    expect(schedules[1]).toMatchObject({ startDate: '2026-08-14', totalDays: 1 })
  })

  it('KST 오늘을 포함한 일정과 가장 가까운 미래 일정을 함께 선택한다', () => {
    const schedules = createContinuousLeaveSchedules(
      [
        leaveUsage,
        { ...leaveUsage, id: 'next', startDate: '2026-08-15', endDate: '2026-08-15' },
      ],
      [leaveGrant],
    )

    const duringCurrent = getCurrentAndNextLeaveSchedules(
      schedules,
      '2026-08-09',
    )
    expect(duringCurrent.currentSchedule?.startDate).toBe('2026-08-08')
    expect(duringCurrent.nextSchedule?.startDate).toBe('2026-08-15')

    const afterCurrent = getCurrentAndNextLeaveSchedules(
      schedules,
      '2026-08-11',
    )
    expect(afterCurrent.currentSchedule).toBeUndefined()
    expect(afterCurrent.nextSchedule?.startDate).toBe('2026-08-15')
    expect(
      afterCurrent.nextSchedule &&
        getLeaveScheduleDday(afterCurrent.nextSchedule, '2026-08-11'),
    ).toBe(4)
  })

  it('개별 사용 기록 id로 해당 기록이 속한 연속 일정을 찾는다', () => {
    const connectedUsage = {
      ...leaveUsage,
      id: 'connected',
      startDate: '2026-08-11' as const,
      endDate: '2026-08-12' as const,
    }
    const schedules = createContinuousLeaveSchedules(
      [leaveUsage, connectedUsage],
      [leaveGrant],
    )

    expect(
      getContinuousLeaveScheduleForUsage(schedules, connectedUsage.id),
    ).toMatchObject({ startDate: '2026-08-08', endDate: '2026-08-12' })
    expect(getContinuousLeaveScheduleForUsage(schedules, 'missing')).toBeUndefined()
  })
})
