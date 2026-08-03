type PageHeaderProps = {
  description: string
  title: string
}

export function PageHeader({ description, title }: PageHeaderProps) {
  return (
    <header>
      <p className="text-sm font-semibold text-brand-600">공군 휴가 캘린더</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </header>
  )
}
