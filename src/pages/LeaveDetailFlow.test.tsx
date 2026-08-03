import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from '../app/App'
import type { LeaveGrant } from '../domain/leave'
import { loadAppState, saveAppState } from '../store/appStorage'

const leaveGrant: LeaveGrant = {
  id: 'leave-grant-1',
  type: 'consolation',
  days: 2,
  acquiredDate: '2026-08-03',
  reason: '주 40시간 근무',
  memo: '첫 번째 기록',
  createdAt: '2026-08-03T00:00:00.000Z',
  updatedAt: '2026-08-03T00:00:00.000Z',
}

describe('보유 휴가 상세·수정·삭제 흐름', () => {
  it('상세에서 보유 휴가를 수정하고 저장한다', async () => {
    saveAppState({ leaveGrants: [leaveGrant] })
    render(
      <MemoryRouter initialEntries={['/leave/leave-grant-1']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText('주 40시간 근무')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: '수정' }))
    fireEvent.change(screen.getByLabelText(/획득 일수/), {
      target: { value: '4' },
    })
    fireEvent.change(screen.getByLabelText(/획득 사유/), {
      target: { value: '수정된 사유' },
    })
    fireEvent.click(screen.getByRole('button', { name: '변경사항 저장' }))

    expect(
      await screen.findByRole('heading', { name: '보유 휴가 상세' }),
    ).toBeInTheDocument()
    expect(screen.getByText('수정된 사유')).toBeInTheDocument()

    await waitFor(() => {
      expect(loadAppState().leaveGrants[0]).toMatchObject({
        days: 4,
        reason: '수정된 사유',
      })
    })
  })

  it('확인 후 보유 휴가를 삭제한다', async () => {
    saveAppState({ leaveGrants: [leaveGrant] })
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(
      <MemoryRouter initialEntries={['/leave/leave-grant-1']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '삭제' }))

    expect(
      await screen.findByRole('heading', { name: '내 휴가' }),
    ).toBeInTheDocument()
    expect(screen.getByText('등록된 보유 휴가가 없어요')).toBeInTheDocument()

    await waitFor(() => {
      expect(loadAppState().leaveGrants).toEqual([])
    })
    confirmSpy.mockRestore()
  })

  it('존재하지 않는 기록 주소는 내 휴가로 돌려보낸다', async () => {
    render(
      <MemoryRouter initialEntries={['/leave/missing']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: '내 휴가' }),
    ).toBeInTheDocument()
  })
})
