import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from '../app/App'
import { APP_STORAGE_KEY } from '../store/appStorage'

describe('보유 휴가 등록 흐름', () => {
  it('입력한 보유 휴가를 목록과 브라우저 저장소에 반영한다', async () => {
    render(
      <MemoryRouter initialEntries={['/leave']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('link', { name: '휴가 추가' }))
    expect(screen.getByLabelText(/휴가 종류/)).toHaveClass(
      'h-14',
      'appearance-none',
    )
    expect(screen.getByLabelText(/획득 날짜/)).toHaveClass(
      'h-14',
      'min-w-0',
      'max-w-full',
      'calendar-date-input',
      'calendar-date-input-centered',
    )
    fireEvent.change(screen.getByLabelText(/휴가 종류/), {
      target: { value: 'consolation' },
    })
    fireEvent.change(screen.getByLabelText(/획득 일수/), {
      target: { value: '2' },
    })
    fireEvent.change(screen.getByLabelText(/획득 날짜/), {
      target: { value: '2026-08-03' },
    })
    fireEvent.change(screen.getByLabelText(/획득 사유/), {
      target: { value: '주 40시간 근무' },
    })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(
      await screen.findByRole('heading', { name: '내 휴가' }),
    ).toBeInTheDocument()
    expect(screen.getByText('위로휴가')).toBeInTheDocument()
    expect(screen.getByText('주 40시간 근무')).toBeInTheDocument()
    expect(screen.getByLabelText('2일')).toBeInTheDocument()
    expect(screen.getByText('총 획득')).toBeInTheDocument()
    expect(screen.getByText('사용 완료')).toBeInTheDocument()
    expect(screen.getByText('사용 예정')).toBeInTheDocument()
    expect(screen.getByText('사용 가능')).toBeInTheDocument()

    await waitFor(() => {
      expect(localStorage.getItem(APP_STORAGE_KEY)).toContain('consolation')
    })
  })

  it('필수값이 없으면 이유를 안내하고 저장하지 않는다', () => {
    render(
      <MemoryRouter initialEntries={['/leave/new']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(screen.getByText('휴가 종류를 선택해주세요.')).toBeInTheDocument()
    expect(
      screen.getByText('획득 일수는 1일 이상의 정수로 입력해주세요.'),
    ).toBeInTheDocument()
    expect(screen.getByText('획득 날짜를 선택해주세요.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '보유 휴가 추가' })).toBeInTheDocument()
  })

  it('공가를 보유 휴가로 등록하고 저장한다', async () => {
    render(
      <MemoryRouter initialEntries={['/leave/new']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('option', { name: '공가' })).toHaveValue('official')
    fireEvent.change(screen.getByLabelText(/휴가 종류/), {
      target: { value: 'official' },
    })
    fireEvent.change(screen.getByLabelText(/획득 일수/), {
      target: { value: '1' },
    })
    fireEvent.change(screen.getByLabelText(/획득 날짜/), {
      target: { value: '2026-08-05' },
    })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByText('공가')).toBeInTheDocument()
    await waitFor(() => {
      expect(localStorage.getItem(APP_STORAGE_KEY)).toContain('official')
    })
  })

  it('작성 중인 폼을 취소할 때 입력 내용 폐기를 확인한다', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(
      <MemoryRouter initialEntries={['/leave/new']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/획득 사유/), {
      target: { value: '작성 중인 사유' },
    })
    fireEvent.click(screen.getByRole('button', { name: '취소' }))

    expect(confirmSpy).toHaveBeenCalledWith(
      '작성한 내용을 저장하지 않고 나갈까요?',
    )
    expect(screen.getByRole('heading', { name: '보유 휴가 추가' })).toBeInTheDocument()

    confirmSpy.mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(
      await screen.findByRole('heading', { name: '내 휴가' }),
    ).toBeInTheDocument()
    confirmSpy.mockRestore()
  })
})
