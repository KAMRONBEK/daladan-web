import { useLocation } from 'react-router-dom'

/**
 * Navbar ostidagi Google AdSense / boshqa display reklama uchun bo'sh joy (faqat bosh sahifa).
 */
export const SiteTopAdSlot = () => {
  const { pathname } = useLocation()
  if (pathname !== '/') return null

  return (
    <div className="hidden md:block">
      <div className="mx-auto flex w-full max-w-7xl justify-center px-4 py-3 md:px-6 lg:px-6">
        <div
          id="daladan-google-top-slot"
          className="min-h-[135px] w-full max-w-[728px] bg-transparent"
          data-slot="google-top-banner"
        />
      </div>
    </div>
  )
}
