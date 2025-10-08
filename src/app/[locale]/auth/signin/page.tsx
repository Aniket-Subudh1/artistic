'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Footer } from '@/components/main/Footer';

export default function SignInPage() {
  const t = useTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign in attempt:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-0 bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            
            <div className="hidden lg:flex bg-gradient-to-br from-purple-100/30 via-purple-200/30 to-purple-100/30 backdrop-blur-sm p-8 flex-col justify-center items-center relative overflow-hidden">
              <div className="relative z-10 right-[160px] bottom-16 w-full h-full flex items-center justify-center">
                <Image
                  src="/login-bg.svg"
                  alt="Login Design"
                  width={320}
                  height={320}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              <div className="absolute bottom-6 left-6">
                <Image
                  src="/logo-main.webp"
                  alt="Artistic Logo"
                  width={100}
                  height={40}
                  className="h-10 w-auto"
                />
              </div>
            </div>

            <div className="p-6 lg:p-8 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-6">
                  <Image
                    src="/logo-main.webp"
                    alt="Artistic Logo"
                    width={100}
                    height={40}
                    className="h-10 w-auto mx-auto"
                  />
                </div>

                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Sign In
                  </h1>
                  <p className="text-gray-700 text-sm">
                    Access your account and unlock all features
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-800" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-1"
                      />
                      <span className="ml-2 text-gray-700">Remember me</span>
                    </label>
                    <Link href="/auth/forgot-password" className="text-purple-600 hover:text-purple-700 transition-colors font-medium">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </form>

                {/* Divider */}
                <div className="my-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300/50"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white/10 text-gray-600">Or continue with</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-center px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-300/50 rounded-xl text-gray-700 font-medium hover:bg-white/90 hover:shadow-md transition-all duration-300"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="mt-4 text-center">
                  <p className="text-gray-700 text-sm">
                    Don't have an account?{' '}
                    <Link href="/auth/signup" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}