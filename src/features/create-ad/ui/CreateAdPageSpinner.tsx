const DOTS = [
  { color: '#f5c518', delay: '0ms' },
  { color: '#22c55e', delay: '160ms' },
  { color: '#ef4444', delay: '320ms' },
] as const

/** Jiji-style three-dot loader shown while create-ad page data loads. */
export function CreateAdPageSpinner() {
  return (
    <div
      className="flex min-h-[min(420px,55vh)] w-full items-start justify-center pt-20"
      role="status"
      aria-live="polite"
      aria-label="Yuklanmoqda"
    >
      <div className="flex items-center gap-3">
        {DOTS.map((dot) => (
          <span
            key={dot.color}
            className="create-ad-dot size-4 rounded-full"
            style={{ backgroundColor: dot.color, animationDelay: dot.delay }}
          />
        ))}
      </div>
    </div>
  )
}
