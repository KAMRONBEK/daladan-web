import { BRAND_NAME } from '../../constants/brand'
import { BrandLogoMark } from './BrandLogoMark'

export const SiteFooter = () => {
  return (
    <footer className="mt-12 border-t border-daladan-border bg-daladan-surfaceElevated dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 text-sm text-daladan-muted dark:text-slate-300 md:px-6 lg:grid-cols-3 lg:px-6">
        <div>
          <div className="flex items-center gap-1.5">
            <BrandLogoMark className="h-10 w-10 text-daladan-heading dark:text-white" maskSize="170%" />
            <span className="text-lg font-medium tracking-wide text-daladan-heading dark:text-slate-100">
              {BRAND_NAME}
            </span>
          </div>
          <p className="mt-2">
            Mahsulotlarni ishlab chiqaruvchidan iste&apos;molchiga yetkazib beruvchi marketplace.
          </p>
        </div>
        <div>
          <p className="font-semibold text-daladan-heading dark:text-slate-100">Yordam</p>
          <p className="mt-2">Qanday sotish kerak?</p>
          <p>Xavfsizlik qoidalari</p>
        </div>
        <div>
          <p className="font-semibold text-daladan-heading dark:text-slate-100">Bog&apos;lanish</p>
          <p className="mt-2 flex flex-col gap-1">
            <a href="tel:+998936567890" className="font-medium text-daladan-primary hover:underline">
              +998 93 656 78 90
            </a>
            <a href="tel:+998332499111" className="font-medium text-daladan-primary hover:underline">
              +998 33 249 91 11
            </a>
          </p>
        </div>
      </div>
      <p className="border-t border-daladan-border py-4 text-center text-xs text-daladan-muted dark:border-slate-700 dark:text-slate-400">
        Dasturchi:{' '}
        <a
          href="https://softwhere.uz"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-daladan-primary hover:underline"
        >
          softwhere.uz
        </a>{' '}
        © 2026
      </p>
    </footer>
  )
}
