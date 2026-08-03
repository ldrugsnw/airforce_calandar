import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { LEAVE_TYPES, type LeaveGrant, type LeaveType } from '../domain/leave'
import { useAppDispatch } from '../store/appStateContext'

type FormErrors = Partial<
  Record<'type' | 'days' | 'acquiredDate', string>
>

export function LeaveCreatePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<FormErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const type = formData.get('type')?.toString() ?? ''
    const daysValue = formData.get('days')?.toString() ?? ''
    const acquiredDate = formData.get('acquiredDate')?.toString() ?? ''
    const days = Number(daysValue)
    const nextErrors: FormErrors = {}

    if (!LEAVE_TYPES.some((leaveType) => leaveType.value === type)) {
      nextErrors.type = '휴가 종류를 선택해주세요.'
    }

    if (!Number.isInteger(days) || days < 1) {
      nextErrors.days = '획득 일수는 1일 이상의 정수로 입력해주세요.'
    }

    if (!acquiredDate) {
      nextErrors.acquiredDate = '획득 날짜를 선택해주세요.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const now = new Date().toISOString()
    const leaveGrant: LeaveGrant = {
      id: crypto.randomUUID(),
      type: type as LeaveType,
      days,
      acquiredDate,
      reason: formData.get('reason')?.toString().trim() ?? '',
      memo: formData.get('memo')?.toString().trim() ?? '',
      createdAt: now,
      updatedAt: now,
    }

    dispatch({ type: 'leaveGrant/added', payload: leaveGrant })
    navigate('/leave', { replace: true })
  }

  return (
    <div>
      <header className="flex items-start gap-3">
        <Link
          aria-label="내 휴가로 돌아가기"
          className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
          to="/leave"
        >
          <svg
            aria-hidden="true"
            className="size-5 fill-none stroke-current stroke-2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15 18-6-6 6-6"
            />
          </svg>
        </Link>
        <div>
          <p className="text-sm font-semibold text-brand-600">내 휴가</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            보유 휴가 추가
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            새로 획득한 휴가를 기록합니다.
          </p>
        </div>
      </header>

      <form className="mt-8 space-y-6" noValidate onSubmit={handleSubmit}>
        <Field label="휴가 종류" required error={errors.type}>
          <select
            aria-invalid={Boolean(errors.type)}
            className={inputClassName(Boolean(errors.type))}
            defaultValue=""
            name="type"
          >
            <option disabled value="">
              휴가 종류 선택
            </option>
            {LEAVE_TYPES.map((leaveType) => (
              <option key={leaveType.value} value={leaveType.value}>
                {leaveType.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="획득 일수" required error={errors.days}>
          <div className="relative">
            <input
              aria-invalid={Boolean(errors.days)}
              className={`${inputClassName(Boolean(errors.days))} pr-12`}
              inputMode="numeric"
              min="1"
              name="days"
              placeholder="예: 3"
              step="1"
              type="number"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-500">
              일
            </span>
          </div>
        </Field>

        <Field label="획득 날짜" required error={errors.acquiredDate}>
          <input
            aria-invalid={Boolean(errors.acquiredDate)}
            className={inputClassName(Boolean(errors.acquiredDate))}
            name="acquiredDate"
            type="date"
          />
        </Field>

        <Field label="획득 사유" hint="선택">
          <input
            className={inputClassName(false)}
            name="reason"
            placeholder="예: 주 40시간 근무"
            type="text"
          />
        </Field>

        <Field label="메모" hint="선택">
          <textarea
            className={`${inputClassName(false)} min-h-28 resize-y py-3`}
            name="memo"
            placeholder="추가로 기억할 내용을 입력하세요."
          />
        </Field>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            to="/leave"
          >
            취소
          </Link>
          <button
            className="min-h-12 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            type="submit"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  )
}

type FieldProps = {
  children: React.ReactNode
  error?: string
  hint?: string
  label: string
  required?: boolean
}

function Field({ children, error, hint, label, required }: FieldProps) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="text-red-500">*</span>}
        {hint && <span className="ml-1 font-normal text-slate-400">{hint}</span>}
      </span>
      <span className="mt-2 block">{children}</span>
      {error && (
        <span className="mt-2 block text-sm text-red-600" role="alert">
          {error}
        </span>
      )}
    </label>
  )
}

function inputClassName(hasError: boolean) {
  return `min-h-12 w-full rounded-xl border bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-3 ${
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
      : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
  }`
}
