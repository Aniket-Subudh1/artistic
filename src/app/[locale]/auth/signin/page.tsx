'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Footer } from '@/components/main/Footer';
import { useAuthLogic } from '@/hooks/useAuth';

export default function SignInPage() {
  const t = useTranslations('auth.signIn');
  const tErrors = useTranslations('auth.signIn.errors');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, isAuthenticated, isLoading: authLoading, user } = useAuthLogic();
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Redirect authenticated users
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // Check if there's a return URL
      const returnUrl = searchParams.get('returnUrl');
      
      if (returnUrl) {
        router.push(returnUrl);
        return;
      }
      
      // Redirect based on role
      switch (user.role) {
        case 'admin':
        case 'super_admin':
          router.push('/dashboard/admin');
          break;
        case 'artist':
          router.push('/dashboard/artist');
          break;
        case 'equipment_provider':
          router.push('/dashboard/equipment-provider');
          break;
        case 'venue_owner':
          router.push('/dashboard/venue-owner');
          break;
        default:
          router.push('/dashboard');
          break;
      }
    }
  }, [authLoading, isAuthenticated, user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError(tErrors('fillAllFields'));
      return;
    }

    try {
      const response = await login(formData.email, formData.password);
      
      // Check if there's a return URL for users
      const returnUrl = searchParams.get('returnUrl');
      
      if (returnUrl && response.role.toUpperCase() === 'USER') {
        // For users who were redirected from artist pages, take them back
        router.push(returnUrl);
        return;
      }
      
      // Redirect based on role
      switch (response.role.toUpperCase()) {
        case 'ADMIN':
        case 'SUPER_ADMIN':
          router.push('/dashboard/admin');
          break;
        case 'ARTIST':
          router.push('/dashboard/artist');
          break;
        case 'EQUIPMENT_PROVIDER':
          router.push('/dashboard/equipment-provider');
          break;
        case 'VENUE_OWNER':
          router.push('/dashboard/venue-owner');
          break;
        default:
          router.push('/dashboard');
          break;
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || tErrors('invalidCredentials'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user starts typing
    if (error) setError('');
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
                    {t('title')}
                  </h1>
                  <p className="text-gray-700 text-sm">
                    {t('subtitle')}
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
                      {t('emailLabel')}
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
                        placeholder={t('emailPlaceholder')}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">
                      {t('passwordLabel')}
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
                        placeholder={t('passwordPlaceholder')}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-500 transition-colors"
                        disabled={isLoading}
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
                        disabled={isLoading}
                      />
                      <span className="ml-2 text-gray-700">{t('rememberMe')}</span>
                    </label>
                    <Link href="/auth/forgot-password" className="text-purple-600 hover:text-purple-700 transition-colors font-medium">
                      {t('forgotPassword')}
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        {t('signingIn')}...
                      </>
                    ) : (
                      <>
                        {t('signInButton')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-700 text-sm">
                    {t('noAccount')}{' '}
                    <Link href="/auth/signup" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                      {t('signUpHere')}
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