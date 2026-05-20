import {
  ChevronRight,
  CirclePlus,
  MapPin,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Sun,
  User,
  UserPlus,
} from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BRAND_NAME } from '../../constants/brand'
import { useAuth } from '../../state/AuthContext'
import { useTheme } from '../../state/ThemeContext'
import { LOGIN_PATH, loginReturnState } from '../../utils/appPaths'
import { BrandLogoMark } from './BrandLogoMark'

const isListingSearchRoute = (pathname: string) => pathname === '/' || pathname === '/search'

export const SiteHeader = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const routeLocation = useLocation()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [inputValue, setInputValue] = useState(() =>
    isListingSearchRoute(routeLocation.pathname)
      ? new URLSearchParams(routeLocation.search).get('q') ?? ''
      : '',
  )
  const [locationInput, setLocationInput] = useState('')

  useEffect(() => {
    if (isListingSearchRoute(routeLocation.pathname)) {
      setInputValue(new URLSearchParams(routeLocation.search).get('q') ?? '')
    } else {
      setInputValue('')
    }
  }, [routeLocation.pathname, routeLocation.search])

  useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const toLogin = () => {
    const returnState = loginReturnState(routeLocation)
    navigate(LOGIN_PATH, {
      ...returnState,
      state: {
        ...returnState.state,
        backgroundLocation: routeLocation,
      },
    })
  }

  const toRegister = () => {
    const returnState = loginReturnState(routeLocation)
    navigate('/register', {
      ...returnState,
      state: {
        ...returnState.state,
        backgroundLocation: routeLocation,
      },
    })
  }

  const toFavorites = () => {
    if (!user) {
      toLogin()
      return
    }
    navigate('/favorites')
  }

  const toProfileTab = (tab: 'profile' | 'messages' | 'ads' | 'payments') => {
    navigate('/profile', { state: { tab } })
    setIsMenuOpen(false)
  }

  const handleLogout = async () => {
    setIsMenuOpen(false)
    await logout()
    navigate('/', { replace: true })
  }

  const commitSearch = (event?: FormEvent) => {
    event?.preventDefault()
    const trimmed = inputValue.trim()
    const next = new URLSearchParams(
      isListingSearchRoute(routeLocation.pathname) ? routeLocation.search : '',
    )
    if (trimmed) {
      next.set('q', trimmed)
    } else {
      next.delete('q')
    }
    const searchStr = next.toString()
    navigate({ pathname: '/', search: searchStr ? `?${searchStr}` : '' })
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-800 shadow-xl dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-1 md:px-6 lg:px-6">

        <Link to="/" className="-my-1 mr-2 flex shrink-0 items-center gap-1.5 py-1 md:mr-3 lg:mr-4">
          <BrandLogoMark className="h-14 w-14 text-white sm:h-16 sm:w-16" maskSize="170%" />
          <span className="text-lg font-medium tracking-wide text-white sm:text-xl">{BRAND_NAME}</span>
        </Link>

        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <form
            onSubmit={commitSearch}
            className="flex h-12 w-full max-w-[840px] min-w-0 items-stretch overflow-hidden rounded-xl border border-[#0f4f69] bg-white"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-l-xl border border-slate-300 bg-white px-3 transition-all focus-within:ring-1 focus-within:ring-daladan-primary/45">
              <Search size={19} className="shrink-0 text-slate-500" />
              <input
                id="site-search"
                name="q"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-[15px] text-slate-800 placeholder:font-medium placeholder:tracking-[0.01em] placeholder:text-slate-400 placeholder:transition-all focus:placeholder:text-slate-300 focus:outline-none"
                placeholder={`${BRAND_NAME} izlang...`}
                autoComplete="off"
              />
            </div>
            <div className="flex min-w-0 w-[260px] items-center gap-2 border border-slate-300 bg-white px-3 transition-all focus-within:ring-1 focus-within:ring-daladan-primary/45">
              <MapPin size={19} className="shrink-0 text-slate-500" />
              <input
                name="location"
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-[15px] text-slate-800 placeholder:font-medium placeholder:tracking-[0.01em] placeholder:text-slate-400 placeholder:transition-all focus:placeholder:text-slate-300 focus:outline-none"
                placeholder="Joylashuv kiriting"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-full w-12 shrink-0 self-stretch items-center justify-center rounded-r-xl bg-daladan-primary text-white transition-colors hover:bg-daladan-primary/90"
              aria-label="Qidiruv"
            >
              <Search size={19} />
            </button>
          </form>
        </div>

        <div className="flex shrink-0 items-center gap-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="group flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-slate-300 transition-colors hover:text-white"
            aria-label={theme === 'dark' ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish"}
          >
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            <span className="hidden text-xs font-medium leading-none text-white transition-colors group-hover:text-slate-400 lg:block">
              Mavzu
            </span>
          </button>

          {user ? (
            <>
              <Link
                to="/profile/ads/new"
                className="group flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-slate-300 transition-colors"
              >
                <CirclePlus size={24} />
                <span className="hidden text-xs font-medium leading-none text-white transition-colors group-hover:text-slate-400 lg:block">
                  E'lon
                </span>
              </Link>
              <button
                type="button"
                onClick={() => navigate('/profile', { state: { tab: 'messages' } })}
                className="group flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-slate-300 transition-colors"
                aria-label="Xabarlar"
              >
                <MessageSquare size={24} />
                <span className="hidden text-xs font-medium leading-none text-white transition-colors group-hover:text-slate-400 lg:block">
                  Xabarlar
                </span>
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="group flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-slate-300 transition-colors"
                  aria-label="Menyu"
                  aria-expanded={isMenuOpen}
                >
                  <Menu size={24} />
                  <span className="hidden text-xs font-medium leading-none text-white transition-colors group-hover:text-slate-400 lg:block">
                    Menyu
                  </span>
                </button>

                {isMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-[60] w-64 overflow-hidden rounded-lg border border-slate-600 bg-slate-800 py-1.5 text-white shadow-2xl">
                    <button
                      type="button"
                      onClick={() => toProfileTab('profile')}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-600"
                    >
                      Mening profilim
                      <ChevronRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toProfileTab('ads')}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-600"
                    >
                      E&apos;lonlarim
                      <ChevronRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toProfileTab('messages')}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-600"
                    >
                      Xabarlar
                      <ChevronRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        toFavorites()
                        setIsMenuOpen(false)
                      }}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-600"
                    >
                      Sevimlilar
                      <ChevronRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleLogout()
                      }}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-600"
                    >
                      Chiqish
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="ml-4 flex items-center gap-0 lg:ml-5">
              <button
                type="button"
                onClick={toLogin}
                className="group flex flex-col items-center gap-1 rounded-lg px-2.5 py-1.5 text-slate-300 transition-colors"
              >
                <CirclePlus size={24} />
                <span className="hidden text-xs font-medium leading-none text-white transition-colors group-hover:text-slate-400 lg:block">
                  E'lon
                </span>
              </button>
              <button
                type="button"
                onClick={toRegister}
                className="group flex flex-col items-center gap-1 rounded-lg px-2.5 py-1.5 text-slate-300 transition-colors"
              >
                <UserPlus size={24} />
                <span className="hidden text-xs font-medium leading-none text-white transition-colors group-hover:text-slate-400 lg:block">
                  Ro'yxat
                </span>
              </button>
              <button
                type="button"
                onClick={toLogin}
                className="group flex flex-col items-center gap-1 rounded-lg px-2.5 py-1.5 text-slate-300 transition-colors"
              >
                <User size={24} />
                <span className="hidden text-xs font-medium leading-none text-white transition-colors group-hover:text-slate-400 lg:block">
                  Kirish
                </span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
