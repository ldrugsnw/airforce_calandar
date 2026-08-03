type EmptyStateProps = {
  description: string
  eyebrow: string
  title: string
}

export function EmptyState({ description, eyebrow, title }: EmptyStateProps) {
  return (
    <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-600 shadow-sm ring-1 ring-slate-200">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
        {description}
      </p>
    </section>
  )
}
