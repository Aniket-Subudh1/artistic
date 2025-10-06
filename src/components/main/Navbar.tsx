"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl shadow-xl"
          : "bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50"
      }`}
    >
      {/* Floating Musical Notes Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="musical-note note-1">♪</div>
        <div className="musical-note note-2">♫</div>
        <div className="musical-note note-3">♪</div>
        <div className="musical-note note-4">♬</div>
        <div className="musical-note note-5">♩</div>
        <div className="musical-note note-6">♪</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-20">
          {/* Logo with artistic glow */}
          <Link href="/" className="flex items-center space-x-2 relative group z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
              <Image
                src="/logo-main.webp"
                alt="Artistic Logo"
                height={70}
                width={140}
                className="relative z-10 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Desktop Navigation with artistic hover effects */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {[
              { href: "/", label: "Home", color: "from-purple-500 to-purple-600" },
              { href: "/events", label: "Events", color: "from-pink-500 to-pink-600" },
              { href: "/artists", label: "Artists", color: "from-orange-500 to-orange-600" },
              { href: "/equipments", label: "Equipment", color: "from-blue-500 to-blue-600" },
              { href: "/about", label: "About", color: "from-green-500 to-green-600" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-gray-700 font-semibold transition-all duration-300 group overflow-hidden rounded-lg"
              >
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                  {item.label}
                </span>
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${item.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg`}
                ></div>
                {/* Musical note appears on hover */}
                <span className="absolute -top-2 -right-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-bounce">
                  ♪
                </span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions with artistic buttons */}
          <div className="hidden md:flex items-center space-x-4 z-10">
            <Link
              href="/signin"
              className="relative px-6 py-2 text-gray-700 font-semibold transition-all duration-300 group"
            >
              <span className="relative z-10 group-hover:text-purple-600 transition-colors">Sign In</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              href="/join-us"
              className="relative px-8 py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-bold rounded-full overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <span className="relative z-10">Join Us</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* Animated musical notes */}
              <span className="absolute top-1 right-2 text-xs animate-bounce opacity-70">♪</span>
              <span className="absolute bottom-1 left-2 text-xs animate-pulse opacity-70">♫</span>
            </Link>
          </div>

          {/* Mobile Menu Button with artistic design */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all duration-300 z-10"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 transition-transform duration-300"
              style={{ transform: isMobileMenuOpen ? "rotate(90deg)" : "rotate(0deg)" }}
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

        {/* Mobile Menu with artistic design */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-purple-200 bg-gradient-to-b from-white/95 to-purple-50/95 backdrop-blur-lg rounded-b-3xl shadow-2xl">
            <nav className="flex flex-col space-y-2">
              {[
                { href: "/", label: "Home", icon: "♪", color: "purple" },
                { href: "/events", label: "Events", icon: "♫", color: "pink" },
                { href: "/artists", label: "Artists", icon: "♬", color: "orange" },
                { href: "/equipments", label: "Equipment", icon: "♩", color: "blue" },
                { href: "/about", label: "About", icon: "♪", color: "green" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mx-4 px-6 py-3 text-gray-700 font-semibold hover:bg-gradient-to-r hover:from-${item.color}-100 hover:to-${item.color}-50 rounded-xl transition-all duration-300 flex items-center justify-between group`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="group-hover:translate-x-2 transition-transform duration-300">{item.label}</span>
                  <span className="text-xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-300">
                    {item.icon}
                  </span>
                </Link>
              ))}
              <Link
                href="/signin"
                className="mx-4 px-6 py-3 text-gray-700 font-semibold hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/join-us"
                className="mx-4 px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white text-center font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="relative z-10">Join Us</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* CSS for floating musical notes animation */}
      <style jsx>{`
        .musical-note {
          position: absolute;
          font-size: 1.5rem;
          opacity: 0.15;
          animation: float 8s ease-in-out infinite;
          color: #9333ea;
        }

        .note-1 {
          top: 10%;
          left: 5%;
          animation-delay: 0s;
          color: #9333ea;
        }

        .note-2 {
          top: 60%;
          left: 15%;
          animation-delay: 1s;
          color: #ec4899;
        }

        .note-3 {
          top: 30%;
          right: 10%;
          animation-delay: 2s;
          color: #f97316;
        }

        .note-4 {
          top: 70%;
          right: 25%;
          animation-delay: 3s;
          color: #3b82f6;
        }

        .note-5 {
          top: 20%;
          left: 50%;
          animation-delay: 4s;
          color: #10b981;
        }

        .note-6 {
          top: 50%;
          right: 5%;
          animation-delay: 5s;
          color: #ec4899;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.15;
          }
          25% {
            transform: translateY(-10px) rotate(5deg);
            opacity: 0.25;
          }
          50% {
            transform: translateY(-20px) rotate(-5deg);
            opacity: 0.15;
          }
          75% {
            transform: translateY(-10px) rotate(3deg);
            opacity: 0.25;
          }
        }

        @media (max-width: 768px) {
          .musical-note {
            font-size: 1rem;
          }
        }
      `}</style>
    </header>
  )
}
