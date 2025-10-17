"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from 'next-intl'
import { Link, useRouter, usePathname } from '@/i18n/routing'
import Image from "next/image"
import { Users, Music, Calendar, Languages, Mic, Package, User } from "lucide-react"
import { useAuthLogic } from '@/hooks/useAuth'

export function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthLogic()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Determine if scrolled enough to change appearance
      setIsScrolled(currentScrollY > 50)
      
      // Determine visibility based on scroll direction
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        // Scrolling up or near top - show navbar
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and not near top - hide navbar
        setIsVisible(false)
        // Close mobile menu if open
        setIsMobileMenuOpen(false)
        // Close dropdowns
        setActiveDropdown(null)
        setShowUserDropdown(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserDropdown) {
        setShowUserDropdown(false)
      }
      if (activeDropdown !== null) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showUserDropdown, activeDropdown])

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en'
    router.replace(pathname, { locale: newLocale })
  }
  
  const navItems = [
    { href: "/", label: t('home') },
    {
      label: t('explore'),
      dropdown: [
        {
          href: "/artists",
          label: t('exploreArtists'),
          icon: Users,
          description: t('exploreArtistsDesc')
        },
        {
          href: "/packages",
          label: t('exploreEquipments'),
          icon: Music,
          description: t('exploreEquipmentsDesc')
        }
      ]
    },
    { href: "/coming-soon", label: t('bookTicket') },
    {
      label: t('createEvent'),
      dropdown: [
        {
          href: "/coming-soon",
          label: t('createEvent'),
          icon: Calendar,
          description: t('createEventDesc')
        },
        {
          href: "/artist",
          label: t('bookArtist'),
          icon: Mic,
          description: t('bookArtistDesc')
        },
        {
          href: "/packages",
          label: t('bookEquipmentPackages'),
          icon: Package,
          description: t('bookEquipmentPackagesDesc')
        }
      ]
    },
    { href: "/join-us", label: t('joinUs') },
  ]

  const handleMouseEnter = (idx: number) => {
    setActiveDropdown(idx)
  }

  const handleMouseLeave = () => {
    setActiveDropdown(null)
  }

  return (
    <>
      <header
        className={`fixed top-0 start-0 end-0 z-50 transition-all duration-500 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${
          isScrolled 
            ? 'bg-white/20 backdrop-blur-xl border-b border-white/20 shadow-lg' 
            : 'bg-gradient-to-r from-purple-100 via-white/80 to-purple-100 backdrop-blur-sm'
        }`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="musical-note note-1">♪</div>
          <div className="musical-note note-2">♫</div>
          <div className="musical-note note-3">♪</div>
          <div className="musical-note note-4">♬</div>
          <div className="musical-note note-5">♩</div>
          <div className="musical-note note-6">♪</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="relative group z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500" />
              <Image
                src="/logo-main.webp"
                alt="Logo"
                height={45}
                width={100}
                className="relative transform group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item, idx) => (
                <div
                  key={idx}
                  className="relative"
                  onMouseEnter={() => item.dropdown && handleMouseEnter(idx)}
                  onMouseLeave={() => item.dropdown && handleMouseLeave()}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 relative overflow-hidden group block ${
                        isScrolled 
                          ? 'text-gray-800 hover:bg-white/30 hover:text-purple-700 hover:shadow-lg backdrop-blur-sm border border-white/20'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-700 hover:shadow-md'
                      }`}
                    >
                      <span className="relative z-10">{item.label}</span>
                      <div className={`absolute inset-0 transition-all duration-500 blur-xl ${
                        isScrolled 
                          ? 'bg-gradient-to-r from-white/0 via-white/0 to-white/0 group-hover:from-white/30 group-hover:via-white/30 group-hover:to-white/30'
                          : 'bg-gradient-to-r from-purple-200/0 via-pink-200/0 to-purple-200/0 group-hover:from-purple-200/50 group-hover:via-pink-200/50 group-hover:to-purple-200/50'
                      }`} />
                    </Link>
                  ) : (
                    <button className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 flex items-center space-x-1 group ${
                      isScrolled 
                        ? 'text-gray-800 hover:bg-white/30 hover:text-purple-700 hover:shadow-lg backdrop-blur-sm border border-white/20'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-700 hover:shadow-md'
                    }`}>
                      <span>{item.label}</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${
                          activeDropdown === idx ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Dropdown Menu */}
                  {item.dropdown && activeDropdown === idx && (
                    <div 
                      className="absolute top-full start-0 pt-2 w-72 animate-dropdown"
                    >
                      <div className={`rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 ${
                        isScrolled 
                          ? 'bg-white/60 border border-white/40'
                          : 'bg-white/95 border border-purple-100/50'
                      }`}>
                        <div className="p-2">
                          {item.dropdown.map((subItem, subIdx) => {
                            const IconComponent = subItem.icon
                            return (
                              <Link
                                key={subIdx}
                                href={subItem.href}
                                className={`flex items-start space-x-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                                  isScrolled
                                    ? 'hover:bg-white/50 backdrop-blur-sm'
                                    : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                                }`}
                              >
                                <div className="w-12 h-12 rounded-xl bg-purple-700 backdrop-blur-md flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-purple-500/30">
                                  <IconComponent className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className={`font-semibold group-hover:text-purple-700 transition-colors ${
                                    isScrolled ? 'text-gray-900' : 'text-gray-900'
                                  }`}>
                                    {subItem.label}
                                  </div>
                                  <div className={`text-xs mt-0.5 ${
                                    isScrolled ? 'text-gray-800' : 'text-gray-600'
                                  }`}>
                                    {subItem.description}
                                  </div>
                                </div>
                                <svg
                                  className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="hidden lg:flex items-center space-x-3 z-10">
              {/* Language Toggle Button */}
              <button
                onClick={toggleLanguage}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-300 hover:shadow-lg ${
                  isScrolled
                    ? 'text-gray-800 border-white/30 hover:border-white/50 hover:bg-white/20 backdrop-blur-sm'
                    : 'text-gray-700 border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                <Languages className="w-4 h-4" />
                <span>{locale === 'en' ? 'العربية' : 'English'}</span>
              </button>
              
              {/* Authentication Section */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 ${
                      isScrolled
                        ? 'bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20'
                        : 'bg-purple-50 hover:bg-purple-100'
                    }`}
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white/50"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className={`text-sm font-medium ${
                      isScrolled ? 'text-gray-800' : 'text-gray-800'
                    }`}>
                      {user.firstName}
                    </span>
                  </button>
                  
                  {showUserDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setShowUserDropdown(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="relative px-6 py-2 text-sm bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  <span className="relative z-10">{t('signIn')}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 animate-pulse-slow opacity-30">
                    <div className="absolute top-0 start-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </div>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl transition-all duration-300 z-10 ${
                isScrolled
                  ? 'text-gray-800 hover:bg-white/20 backdrop-blur-sm border border-white/20'
                  : 'text-gray-700 hover:bg-purple-100'
              }`}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 transition-transform duration-300"
                style={{ transform: isMobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden pb-6 pt-4 animate-dropdown">
              <div className={`backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
                isScrolled
                  ? 'bg-white/60 border border-white/40'
                  : 'bg-white/95 border border-purple-100'
              }`}>
                <nav className="p-4 space-y-2">
                  {navItems.map((item, idx) => (
                    <div key={idx}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className={`block px-4 py-2.5 text-sm font-medium rounded-2xl transition-all duration-300 ${
                            isScrolled
                              ? 'text-gray-800 hover:bg-white/30 hover:text-purple-700 backdrop-blur-sm'
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-700'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <>
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === idx ? null : idx)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-2xl transition-all duration-300 ${
                              isScrolled
                                ? 'text-gray-800 hover:bg-white/30 hover:text-purple-700 backdrop-blur-sm'
                                : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-700'
                            }`}
                          >
                            <span>{item.label}</span>
                            <svg
                              className={`w-4 h-4 transition-transform duration-300 ${
                                activeDropdown === idx ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {activeDropdown === idx && item.dropdown && (
                            <div className="mt-2 ms-4 space-y-1">
                              {item.dropdown.map((subItem, subIdx) => {
                                const IconComponent = subItem.icon
                                return (
                                  <Link
                                    key={subIdx}
                                    href={subItem.href}
                                    className={`flex items-center space-x-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${
                                      isScrolled
                                        ? 'text-gray-700 hover:bg-white/30 hover:text-purple-700 backdrop-blur-sm'
                                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700'
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-purple-700 flex items-center justify-center flex-shrink-0">
                                      <IconComponent className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="font-medium">{subItem.label}</span>
                                  </Link>
                                )
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </nav>
                
                <div className={`px-4 pb-4 space-y-3 border-t pt-4 ${
                  isScrolled ? 'border-white/20' : 'border-purple-100'
                }`}>
                  <button
                    onClick={toggleLanguage}
                    className={`flex items-center justify-center space-x-2 w-full px-4 py-2.5 text-sm font-semibold rounded-2xl border-2 transition-all duration-300 ${
                      isScrolled
                        ? 'text-gray-800 border-white/30 hover:bg-white/20 backdrop-blur-sm'
                        : 'text-gray-700 border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    <Languages className="w-4 h-4" />
                    <span>{locale === 'en' ? 'العربية' : 'English'}</span>
                  </button>
                  
                  {/* Mobile Authentication Section */}
                  {isAuthenticated && user ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 px-4 py-3 bg-purple-50 rounded-xl">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {user.role.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        className="block w-full px-4 py-2.5 text-sm text-center bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="block w-full px-4 py-2.5 text-sm text-center bg-red-500 text-white font-medium rounded-2xl hover:bg-red-600 transition-all duration-300"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="block w-full px-4 py-2.5 text-sm text-center bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('signIn')}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <style jsx>{`
        .musical-note {
          position: absolute;
          font-size: 1.5rem;
          opacity: 0.2;
          animation: float 10s ease-in-out infinite;
          pointer-events: none;
        }

        .note-1 {
          top: 20%;
          inset-inline-start: 8%;
          animation-delay: 0s;
          color: #a855f7;
        }

        .note-2 {
          top: 60%;
          inset-inline-start: 18%;
          animation-delay: 1.5s;
          color: #ec4899;
        }

        .note-3 {
          top: 35%;
          inset-inline-end: 12%;
          animation-delay: 3s;
          color: #f97316;
        }

        .note-4 {
          top: 70%;
          inset-inline-end: 28%;
          animation-delay: 4.5s;
          color: #3b82f6;
        }

        .note-5 {
          top: 15%;
          inset-inline-start: 45%;
          animation-delay: 6s;
          color: #10b981;
        }

        .note-6 {
          top: 55%;
          inset-inline-end: 8%;
          animation-delay: 7.5s;
          color: #ec4899;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
          }
          25% {
            transform: translateY(-15px) rotate(8deg);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-25px) rotate(-8deg);
            opacity: 0.2;
          }
          75% {
            transform: translateY(-15px) rotate(5deg);
            opacity: 0.35;
          }
        }

        @keyframes dropdown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-dropdown {
          animation: dropdown 0.3s ease-out;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @media (max-width: 1024px) {
          .musical-note {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </>
  )
}