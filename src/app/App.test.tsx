import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { App } from './App'

describe('앱 기본 화면 이동', () => {
  it('하단 내비게이션으로 홈, 달력, 내 휴가 화면을 이동한다', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '홈' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '주요 화면' })).toHaveClass(
      'bottom-navigation',
      'bottom-0',
      'bg-white',
    )

    fireEvent.click(screen.getByRole('link', { name: '달력' }))
    expect(screen.getByRole('heading', { name: '달력' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: '내 휴가' }))
    expect(screen.getByRole('heading', { name: '내 휴가' })).toBeInTheDocument()
  })
})
