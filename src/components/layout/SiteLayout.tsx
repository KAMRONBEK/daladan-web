import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { MobileBottomNav } from './MobileBottomNav'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { SiteTopAdSlot } from './SiteTopAdSlot'

export const SiteLayout = ({ children, hideFooter }: { children?: ReactNode; hideFooter?: boolean }) => {
  return (
    <div className="min-h-screen bg-[#ebf2f7] dark:bg-slate-950">
      <div className="hidden md:block">
        <SiteHeader />
      </div>
      <SiteTopAdSlot />
      <main className="mx-auto w-full max-w-7xl px-4 pt-6 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:px-6 md:py-6 lg:px-6">
        {children ?? <Outlet />}
      </main>
      {!hideFooter && (
        <div className="hidden md:block">
          <SiteFooter />
        </div>
      )}
      <MobileBottomNav />
    </div>
  )
}
