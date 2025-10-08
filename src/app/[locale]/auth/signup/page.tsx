'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Eye, EyeOff, Mail, User, Lock, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { Footer } from '@/components/main/Footer';

const countries = [
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' }
];

export default function SignUpPage() {
  const t = useTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [selectedCountry, setSelectedCountry] = useState({
    code: '+965',
    flag: '🇰🇼',
    name: 'Kuwait'
  });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false
  });

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up attempt:', formData, agreements);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAgreementChange = (field: string) => {
    setAgreements(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <Image
          src="/design.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/50 to-pink-50/80"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-0 bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            
            <div className="p-4 lg:p-6 flex flex-col justify-center order-2 lg:order-1">
              <div className="max-w-sm mx-auto w-full">
                <div className="lg:hidden text-center mb-4">
                  <Image
                    src="/logo-main.webp"
                    alt="Artistic Logo"
                    width={80}
                    height={32}
                    className="h-8 w-auto mx-auto"
                  />
                </div>

                <div className="text-center mb-4">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    Create Account
                  </h1>
                  <p className="text-gray-700 text-xs">
                    Already have an account?{' '}
                    <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                      Sign in here
                    </Link>
                  </p>
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-center px-3 py-2.5 mb-3 bg-white/70 backdrop-blur-sm border border-gray-300/50 rounded-lg text-gray-700 text-sm font-medium hover:bg-white/90 hover:shadow-md transition-all duration-300"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>

                <div className="my-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300/50"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white/10 text-gray-600">Or continue with email</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="firstName" className="block text-xs font-medium text-gray-800 mb-1">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-900" />
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full pl-8 pr-2 py-2.5 text-sm border border-gray-300/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-xs font-medium text-gray-800 mb-1">
                        Last Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-900" />
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full pl-8 pr-2 py-2.5 text-sm border border-gray-300/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-800 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-900" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-8 pr-2 py-2.5 text-sm border border-gray-300/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                        placeholder="john.doe@example.com"
                        required
                      />
                    </div>
                  </div>

                 
                  <div>
                    <label htmlFor="mobile" className="block text-xs font-medium text-gray-800 mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <div className="flex">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className="flex items-center px-2.5 py-2.5 bg-white/70 backdrop-blur-sm border border-gray-300/50 border-r-0 rounded-l-lg text-xs font-medium text-gray-700 hover:bg-white/90 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <span className="mr-1">{selectedCountry.flag}</span>
                            <span className="mr-1">{selectedCountry.code}</span>
                            <ChevronDown className="w-3 h-3 text-gray-900" />
                          </button>
                          
                          {showCountryDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                              {countries.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => handleCountrySelect(country)}
                                  className="w-full flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-purple-50 transition-colors text-left"
                                >
                                  <span className="mr-2">{country.flag}</span>
                                  <span className="mr-2 font-medium">{country.code}</span>
                                  <span className="text-gray-600">{country.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <input
                          type="tel"
                          id="mobile"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          className="flex-1 px-2 py-2.5 text-sm border border-gray-300/50 border-l-0 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                          placeholder="12345678"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="password" className="block text-xs font-medium text-gray-800 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-900" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-8 pr-8 py-2.5 text-sm border border-gray-300/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                          placeholder="Password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-900 hover:text-purple-500 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-800 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-900" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full pl-8 pr-8 py-2.5 text-sm border border-gray-300/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                          placeholder="Confirm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-900 hover:text-purple-500 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreements.terms}
                        onChange={() => handleAgreementChange('terms')}
                        className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-1 mt-0.5 mr-2 flex-shrink-0"
                        required
                      />
                      <span className="text-gray-700 leading-tight">
                        I agree to the{' '}
                        <Link href="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
                          Terms of Service
                        </Link> *
                      </span>
                    </label>
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreements.privacy}
                        onChange={() => handleAgreementChange('privacy')}
                        className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-1 mt-0.5 mr-2 flex-shrink-0"
                        required
                      />
                      <span className="text-gray-700 leading-tight">
                        I agree to the{' '}
                        <Link href="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                          Privacy Policy
                        </Link> *
                      </span>
                    </label>
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreements.marketing}
                        onChange={() => handleAgreementChange('marketing')}
                        className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-1 mt-0.5 mr-2 flex-shrink-0"
                      />
                      <span className="text-gray-700 leading-tight">
                        I would like to receive marketing communications (optional)
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
                  >
                    Create Account
                  </button>
                </form>

                <div className="mt-3 text-center">
                  <Link href="/" className="text-gray-600 hover:text-purple-600 text-xs transition-colors">
                    ← Back to Home
                  </Link>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex bg-gradient-to-br from-purple-100/30 via-purple-200/30 to-purple-100/30 backdrop-blur-sm p-6 flex-col justify-center items-center relative overflow-hidden order-1 lg:order-2">
              <div className="relative z-10 left-[160px] bottom-12 w-full h-full flex items-center justify-center">
                <Image
                  src="/signup-bg.svg"
                  alt="Signup Design"
                  width={350}
                  height={280}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              <div className="absolute bottom-4 right-4">
                <Image
                  src="/logo-main.webp"
                  alt="Artistic Logo"
                  width={80}
                  height={32}
                  className="h-8 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}