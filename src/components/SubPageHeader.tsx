import { Link } from 'react-router'

type SubPageHeaderProps = {
  backTo: string
  description: string
  eyebrow: string
  title: string
}

export function SubPageHeader({
  backTo,
  description,
  eyebrow,
  title,
}: SubPageHeaderProps) {
  return (
    <header className="flex items-start gap-3">
      <Link
        aria-label="이전 화면으로 돌아가기"
        className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
        to={backTo}
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
        <p className="text-sm font-semibold text-brand-600">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </header>
  )
}
