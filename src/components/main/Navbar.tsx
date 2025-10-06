'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-gradient-to-r from-white via-purple-100 to-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Artistic
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Home
            </Link>
            <Link href="/events" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Events
            </Link>
            <Link href="/artists" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Artists
            </Link>
            <Link href="/equipments" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Equipment
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              About
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/signin" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/join-us" className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300">
              Join Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/events" className="px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                Events
              </Link>
              <Link href="/artists" className="px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                Artists
              </Link>
              <Link href="/equipments" className="px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                Equipment
              </Link>
              <Link href="/about" className="px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </Link>
              <Link href="/signin" className="px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link href="/join-us" className="mx-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-center rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                Join Us
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}