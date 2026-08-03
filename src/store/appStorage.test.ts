import type { LeaveGrant } from '../domain/leave'
import { APP_STORAGE_KEY, loadAppState, saveAppState } from './appStorage'

describe('앱 상태 브라우저 저장', () => {
  const leaveGrant: LeaveGrant = {
    id: 'leave-grant-1',
    type: 'performance',
    days: 3,
    acquiredDate: '2026-08-03',
    reason: '성과제',
    memo: '첫 번째 기록',
    createdAt: '2026-08-03T00:00:00.000Z',
    updatedAt: '2026-08-03T00:00:00.000Z',
  }

  it('저장한 보유 휴가를 다시 불러온다', () => {
    saveAppState({ leaveGrants: [leaveGrant] })

    expect(loadAppState()).toEqual({ leaveGrants: [leaveGrant] })
  })

  it('이해할 수 없는 데이터이면 빈 상태를 사용한다', () => {
    localStorage.setItem(APP_STORAGE_KEY, '{"version":99}')

    expect(loadAppState()).toEqual({ leaveGrants: [] })
  })
})
