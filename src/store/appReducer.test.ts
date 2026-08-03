import type { LeaveGrant } from '../domain/leave'
import { appReducer, initialAppState } from './appReducer'

describe('appReducer', () => {
  it('보유 휴가를 기존 목록 뒤에 추가한다', () => {
    const leaveGrant: LeaveGrant = {
      id: 'leave-grant-1',
      type: 'consolation',
      days: 2,
      acquiredDate: '2026-08-01',
      reason: '주 40시간 근무',
      memo: '',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    }

    const nextState = appReducer(initialAppState, {
      type: 'leaveGrant/added',
      payload: leaveGrant,
    })

    expect(nextState.leaveGrants).toEqual([leaveGrant])
    expect(initialAppState.leaveGrants).toEqual([])
  })
})
