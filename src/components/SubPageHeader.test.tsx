import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { SubPageHeader } from './SubPageHeader'

describe('하위 화면 헤더', () => {
  it('뒤로가기 터치 영역을 제목과 같은 선상에 배치하고 터치 피드백을 제공한다', () => {
    render(
      <MemoryRouter>
        <SubPageHeader
          backTo="/leave"
          description="새로 획득한 휴가를 기록합니다."
          eyebrow="내 휴가"
          title="보유 휴가 추가"
        />
      </MemoryRouter>,
    )

    const backLink = screen.getByRole('link', {
      name: '이전 화면으로 돌아가기',
    })
    const title = screen.getByRole('heading', { name: '보유 휴가 추가' })

    expect(backLink).toHaveClass(
      'size-12',
      'active:scale-95',
      'active:bg-slate-200',
    )
    expect(backLink.parentElement).toBe(title.parentElement)
  })
})
