/**
 * Navbar ostidagi Google AdSense / boshqa display reklama uchun bo'sh joy (keyinroq snippet shu id ga qo'yiladi).
 */
export const SiteTopAdSlot = () => {
  return (
    <div className="hidden md:block">
      <div className="mx-auto flex w-full max-w-7xl justify-center px-4 py-0 md:px-6 lg:px-6">
        <div
          id="daladan-google-top-slot"
          className="h-[1px] w-full max-w-[728px]"
          data-slot="google-top-banner"
        />
      </div>
    </div>
  )
}
