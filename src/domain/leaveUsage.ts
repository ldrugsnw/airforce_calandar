import {
  getInclusiveDayCount,
  type CalendarDate,
} from './calendarDate'
import type { LeaveGrant } from './leave'

export type LeaveUsage = {
  id: string
  leaveGrantId: string
  startDate: CalendarDate
  endDate: CalendarDate
  canceled: boolean
  canceledAt: string | null
  createdAt: string
  updatedAt: string
}

export type LeaveUsageStatus = 'scheduled' | 'inProgress' | 'completed'

export type LeaveGrantSummary = {
  totalDays: number
  completedDays: number
  scheduledDays: number
  availableDays: number
}

export type LeaveUsageValidation =
  | { valid: true }
  | { valid: false; reason: 'leaveGrantNotFound' | 'insufficientDays' | 'overlap'; message: string }

export function getLeaveUsageDays(leaveUsage: LeaveUsage) {
  return getInclusiveDayCount(leaveUsage.startDate, leaveUsage.endDate)
}

export function getLeaveUsageStatus(
  leaveUsage: LeaveUsage,
  today: CalendarDate,
): LeaveUsageStatus {
  if (today < leaveUsage.startDate) return 'scheduled'
  if (today <= leaveUsage.endDate) return 'inProgress'
  return 'completed'
}

export function getLeaveUsageStatusLabel(status: LeaveUsageStatus) {
  const labels: Record<LeaveUsageStatus, string> = {
    scheduled: '사용 예정',
    inProgress: '휴가 중',
    completed: '사용 완료',
  }

  return labels[status]
}

export function getLeaveGrantSummary(
  leaveGrant: LeaveGrant,
  leaveUsages: LeaveUsage[],
  today: CalendarDate,
): LeaveGrantSummary {
  const activeUsages = leaveUsages.filter(
    (usage) => usage.leaveGrantId === leaveGrant.id && !usage.canceled,
  )

  return activeUsages.reduce<LeaveGrantSummary>(
    (summary, usage) => {
      const usageDays = getLeaveUsageDays(usage)
      const status = getLeaveUsageStatus(usage, today)

      return {
        ...summary,
        completedDays:
          summary.completedDays + (status === 'completed' ? usageDays : 0),
        scheduledDays:
          summary.scheduledDays + (status === 'scheduled' ? usageDays : 0),
        availableDays: summary.availableDays - usageDays,
      }
    },
    {
      totalDays: leaveGrant.days,
      completedDays: 0,
      scheduledDays: 0,
      availableDays: leaveGrant.days,
    },
  )
}

export function getUsedDaysForGrant(
  leaveGrantId: string,
  leaveUsages: LeaveUsage[],
) {
  return leaveUsages
    .filter((usage) => usage.leaveGrantId === leaveGrantId && !usage.canceled)
    .reduce((sum, usage) => sum + getLeaveUsageDays(usage), 0)
}

export function getAvailableDays(
  leaveGrant: LeaveGrant,
  leaveUsages: LeaveUsage[],
) {
  return leaveGrant.days - getUsedDaysForGrant(leaveGrant.id, leaveUsages)
}

export function doDateRangesOverlap(
  firstStart: CalendarDate,
  firstEnd: CalendarDate,
  secondStart: CalendarDate,
  secondEnd: CalendarDate,
) {
  return firstStart <= secondEnd && secondStart <= firstEnd
}

export function validateLeaveUsage(
  input: Pick<LeaveUsage, 'leaveGrantId' | 'startDate' | 'endDate'>,
  leaveGrants: LeaveGrant[],
  leaveUsages: LeaveUsage[],
  excludedUsageId?: string,
): LeaveUsageValidation {
  const otherLeaveUsages = leaveUsages.filter(
    (leaveUsage) => leaveUsage.id !== excludedUsageId,
  )
  const leaveGrant = leaveGrants.find((grant) => grant.id === input.leaveGrantId)

  if (!leaveGrant) {
    return {
      valid: false,
      reason: 'leaveGrantNotFound',
      message: '사용할 보유 휴가를 선택해주세요.',
    }
  }

  const requestedDays = getInclusiveDayCount(input.startDate, input.endDate)
  const availableDays = getAvailableDays(leaveGrant, otherLeaveUsages)

  if (requestedDays > availableDays) {
    return {
      valid: false,
      reason: 'insufficientDays',
      message: `사용 가능한 휴가가 ${requestedDays - availableDays}일 부족합니다.`,
    }
  }

  const overlappingUsage = otherLeaveUsages.find(
    (usage) =>
      !usage.canceled &&
      doDateRangesOverlap(
        input.startDate,
        input.endDate,
        usage.startDate,
        usage.endDate,
      ),
  )

  if (overlappingUsage) {
    return {
      valid: false,
      reason: 'overlap',
      message: `이미 등록된 ${overlappingUsage.startDate} ~ ${overlappingUsage.endDate} 일정과 겹칩니다.`,
    }
  }

  return { valid: true }
}
