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
    <header>
      <p className="pl-15 text-sm font-semibold text-brand-600">{eyebrow}</p>
      <div className="mt-1 flex min-w-0 items-center gap-3">
        <Link
          aria-label="이전 화면으로 돌아가기"
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl text-slate-600 transition-[background-color,color,transform] duration-150 ease-out hover:bg-slate-100 hover:text-slate-950 active:scale-95 active:bg-slate-200 motion-reduce:transform-none motion-reduce:transition-none"
          to={backTo}
        >
          <svg
            aria-hidden="true"
            className="size-6 fill-none stroke-current stroke-2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15 18-6-6 6-6"
            />
          </svg>
        </Link>
        <h1 className="min-w-0 text-2xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>
      </div>
      <p className="mt-2 pl-15 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </header>
  )
}
