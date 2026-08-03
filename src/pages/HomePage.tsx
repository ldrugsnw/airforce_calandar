import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'

export function HomePage() {
  return (
    <>
      <PageHeader
        description="다음 휴가와 사용할 수 있는 휴가를 빠르게 확인하세요."
        title="홈"
      />
      <EmptyState
        description="보유 휴가와 사용 일정을 등록하면 다음 휴가 D-day가 이곳에 표시됩니다."
        eyebrow="준비 완료"
        title="아직 예정된 휴가가 없어요"
      />
    </>
  )
}
