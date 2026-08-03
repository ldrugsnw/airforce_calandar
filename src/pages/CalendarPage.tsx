import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'

export function CalendarPage() {
  return (
    <>
      <PageHeader
        description="휴가 일정을 종류별 색상으로 확인하고 계획하세요."
        title="달력"
      />
      <EmptyState
        description="월간 달력과 날짜 범위 선택 기능은 날짜 계산 단계에서 추가합니다."
        eyebrow="0단계"
        title="달력 화면을 준비하고 있어요"
      />
    </>
  )
}
