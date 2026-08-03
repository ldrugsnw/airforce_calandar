import type { LeaveGrant } from '../domain/leave'
import { appReducer, initialAppState } from './appReducer'

describe('appReducer', () => {
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

  it('보유 휴가를 기존 목록 뒤에 추가한다', () => {
    const nextState = appReducer(initialAppState, {
      type: 'leaveGrant/added',
      payload: leaveGrant,
    })

    expect(nextState.leaveGrants).toEqual([leaveGrant])
    expect(initialAppState.leaveGrants).toEqual([])
  })

  it('같은 id의 보유 휴가만 수정한다', () => {
    const updatedLeaveGrant = { ...leaveGrant, days: 4 }

    const nextState = appReducer(
      { leaveGrants: [leaveGrant] },
      { type: 'leaveGrant/updated', payload: updatedLeaveGrant },
    )

    expect(nextState.leaveGrants).toEqual([updatedLeaveGrant])
  })

  it('같은 id의 보유 휴가만 삭제한다', () => {
    const nextState = appReducer(
      { leaveGrants: [leaveGrant] },
      { type: 'leaveGrant/deleted', payload: { id: leaveGrant.id } },
    )

    expect(nextState.leaveGrants).toEqual([])
  })
})
