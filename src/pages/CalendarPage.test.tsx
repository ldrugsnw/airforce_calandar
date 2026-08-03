import { fireEvent, render, screen } from '@testing-library/react'
import { CalendarPage } from './CalendarPage'

describe('월간 달력', () => {
  it('월을 이동하고 두 날짜를 이른 순서로 선택해 포함 일수를 보여준다', () => {
    render(<CalendarPage />)

    const currentMonth = screen.getByRole('heading', { level: 2 }).textContent
    fireEvent.click(screen.getByRole('button', { name: '다음 달' }))
    expect(screen.getByRole('heading', { level: 2 })).not.toHaveTextContent(currentMonth ?? '')

    const dateButtons = screen
      .getAllByRole('button')
      .filter((button) => /^\d{4}년 \d{1,2}월 \d{1,2}일/.test(button.getAttribute('aria-label') ?? ''))
    const eighth = dateButtons.find((button) => button.textContent === '8')
    const tenth = dateButtons.find((button) => button.textContent === '10')

    if (!eighth || !tenth) throw new Error('테스트할 날짜 버튼을 찾지 못했습니다.')

    fireEvent.click(tenth)
    fireEvent.click(eighth)

    expect(screen.getByText(/주말과 공휴일을 포함해 총/)).toHaveTextContent('총 3일이에요.')
    expect(eighth).toHaveAttribute('aria-pressed', 'true')
    expect(tenth).toHaveAttribute('aria-pressed', 'true')
  })
})
