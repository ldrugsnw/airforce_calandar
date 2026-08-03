import { useNavigate } from 'react-router'
import {
  LeaveGrantForm,
  type LeaveGrantFormValues,
} from '../components/LeaveGrantForm'
import { SubPageHeader } from '../components/SubPageHeader'
import type { LeaveGrant } from '../domain/leave'
import { useAppDispatch } from '../store/appStateContext'

export function LeaveCreatePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  function handleSubmit(values: LeaveGrantFormValues) {
    const now = new Date().toISOString()
    const leaveGrant: LeaveGrant = {
      id: crypto.randomUUID(),
      ...values,
      createdAt: now,
      updatedAt: now,
    }

    dispatch({ type: 'leaveGrant/added', payload: leaveGrant })
    navigate('/leave', { replace: true })
  }

  return (
    <div>
      <SubPageHeader
        backTo="/leave"
        description="새로 획득한 휴가를 기록합니다."
        eyebrow="내 휴가"
        title="보유 휴가 추가"
      />
      <LeaveGrantForm
        onCancel={() => navigate('/leave')}
        onSubmit={handleSubmit}
        submitLabel="저장"
      />
    </div>
  )
}
