"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: "/", label: "Home" },
    {
      label: "Explore",
      dropdown: [
        {
          href: "/artists",
          label: "Explore Artists",
          icon: "👥",
          description: "Discover talented artists",
          color: "from-violet-400 to-purple-500"
        },
        {
          href: "/equipments",
          label: "Explore Equipments",
          icon: "🎵",
          description: "Browse available equipment",
          color: "from-emerald-400 to-teal-500"
        }
      ]
    },
    { href: "/book-ticket", label: "Book Your Ticket" },
    {
      label: "Create Event",
      dropdown: [
        {
          href: "/create-event",
          label: "Create an Event",
          icon: "📅",
          description: "Organize and manage events",
          color: "from-pink-400 to-rose-500"
        },
        {
          href: "/book-artist",
          label: "Book Artist",
          icon: "🎤",
          description: "Find and book artists",
          color: "from-purple-400 to-indigo-500"
        },
        {
          href: "/book-equipment",
          label: "Book Equipment",
          icon: "🎹",
          description: "Rent professional equipment",
          color: "from-amber-400 to-orange-500"
        }
      ]
    },
    { href: "/join-us", label: "Join Us" }
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
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-gradient-to-r from-white via-white to-white backdrop-blur-sm"
        
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
                      className="px-4 py-2 text-sm text-gray-700 font-medium rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-700 hover:shadow-md relative overflow-hidden group block"
                    >
                      <span className="relative z-10">{item.label}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-200/0 via-pink-200/0 to-purple-200/0 group-hover:from-purple-200/50 group-hover:via-pink-200/50 group-hover:to-purple-200/50 transition-all duration-500 blur-xl" />
                    </Link>
                  ) : (
                    <button className="px-4 py-2 text-sm text-gray-700 font-medium rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-700 hover:shadow-md flex items-center space-x-1 group">
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
                      className="absolute top-full left-0 pt-2 w-72 animate-dropdown"
                    >
                      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100/50 backdrop-blur-xl">
                        <div className="p-2">
                          {item.dropdown.map((subItem, subIdx) => (
                            <Link
                              key={subIdx}
                              href={subItem.href}
                              className="flex items-start space-x-4 p-4 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 group relative overflow-hidden"
                            >
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subItem.color} flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                {subItem.icon}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                                  {subItem.label}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
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
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="hidden lg:flex items-center space-x-3 z-10">
              <Link
                href="/signin"
                className="px-5 py-2 text-sm text-gray-700 font-semibold rounded-full border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 hover:shadow-lg"
              >
                Sign In
              </Link>
              <Link
                href="/join-us"
                className="relative px-6 py-2 text-sm bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                <span className="relative z-10">Join Us</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 animate-pulse-slow opacity-30">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-purple-100 rounded-xl transition-all duration-300 z-10"
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
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
                <nav className="p-4 space-y-2">
                  {navItems.map((item, idx) => (
                    <div key={idx}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 font-medium rounded-2xl hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-700 transition-all duration-300"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <>
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === idx ? null : idx)}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 font-medium rounded-2xl hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-700 transition-all duration-300"
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
                            <div className="mt-2 ml-4 space-y-1">
                              {item.dropdown.map((subItem, subIdx) => (
                                <Link
                                  key={subIdx}
                                  href={subItem.href}
                                  className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-300"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <span className="text-xl">{subItem.icon}</span>
                                  <span className="font-medium">{subItem.label}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </nav>
                
                <div className="px-4 pb-4 space-y-3 border-t border-purple-100 pt-4">
                  <Link
                    href="/signin"
                    className="block w-full px-4 py-2.5 text-sm text-center text-gray-700 font-semibold rounded-2xl border-2 border-purple-200 hover:bg-purple-50 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/join-us"
                    className="block w-full px-4 py-2.5 text-sm text-center bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Join Us
                  </Link>
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
          left: 8%;
          animation-delay: 0s;
          color: #a855f7;
        }

        .note-2 {
          top: 60%;
          left: 18%;
          animation-delay: 1.5s;
          color: #ec4899;
        }

        .note-3 {
          top: 35%;
          right: 12%;
          animation-delay: 3s;
          color: #f97316;
        }

        .note-4 {
          top: 70%;
          right: 28%;
          animation-delay: 4.5s;
          color: #3b82f6;
        }

        .note-5 {
          top: 15%;
          left: 45%;
          animation-delay: 6s;
          color: #10b981;
        }

        .note-6 {
          top: 55%;
          right: 8%;
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