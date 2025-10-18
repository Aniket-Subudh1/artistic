'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { Eye, EyeOff, Mail, User, Lock, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { Footer } from '@/components/main/Footer';
import { useAuthLogic } from '@/hooks/useAuth';

export default function SignUpPage() {
  const t = useTranslations('auth.signUp');
  const tCountries = useTranslations('auth.countries');
  const tErrors = useTranslations('auth.signUp.errors');
  const tSuccess = useTranslations('auth.signUp.success');
  const router = useRouter();
  const { signup, isLoading } = useAuthLogic();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const countries = [
    { code: '+965', flag: '🇰🇼', name: tCountries('kuwait') },
    { code: '+1', flag: '🇺🇸', name: tCountries('unitedStates') },
    { code: '+44', flag: '🇬🇧', name: tCountries('unitedKingdom') },
    { code: '+971', flag: '🇦🇪', name: tCountries('uae') },
    { code: '+966', flag: '🇸🇦', name: tCountries('saudiArabia') },
    { code: '+974', flag: '🇶🇦', name: tCountries('qatar') },
    { code: '+973', flag: '🇧🇭', name: tCountries('bahrain') },
    { code: '+968', flag: '🇴🇲', name: tCountries('oman') },
    { code: '+91', flag: '🇮🇳', name: tCountries('india') }
  ];

  const [selectedCountry, setSelectedCountry] = useState({
    code: '+965',
    flag: '🇰🇼',
    name: tCountries('kuwait')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobile || !formData.password) {
      setError(tErrors('fillAllFields'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(tErrors('passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(tErrors('passwordTooShort'));
      return;
    }

    if (!agreements.terms || !agreements.privacy) {
      setError(tErrors('acceptTerms'));
      return;
    }

    try {
      const phoneNumber = selectedCountry.code + formData.mobile;
      const response = await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: phoneNumber,
        password: formData.password,
        role: 'user', 
      });

      // Check if response indicates OTP verification is needed
      if (response.message?.includes('verify') || response.message?.includes('otp')) {
        setSuccess(tSuccess('accountCreatedVerify'));
        
        // Redirect to OTP verification page with phone number
        setTimeout(() => {
          router.push(`/auth/verify-otp?phone=${encodeURIComponent(phoneNumber)}`);
        }, 2000);
      } else {
        setSuccess(tSuccess('accountCreatedSignIn'));
        
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || tErrors('registrationFailed'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
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
                    {t('title')}
                  </h1>
                  <p className="text-gray-700 text-xs">
                    {t('alreadyHaveAccount')}{' '}
                    <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                      {t('signInHere')}
                    </Link>
                  </p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="firstName" className="block text-xs font-medium text-gray-800 mb-1">
                        {t('firstNameLabel')} {t('required')}
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
                          placeholder={t('firstNamePlaceholder')}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-xs font-medium text-gray-800 mb-1">
                        {t('lastNameLabel')} {t('required')}
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
                          placeholder={t('lastNamePlaceholder')}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-800 mb-1">
                      {t('emailLabel')} {t('required')}
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
                        placeholder={t('emailPlaceholder')}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="mobile" className="block text-xs font-medium text-gray-800 mb-1">
                      {t('mobileLabel')} {t('required')}
                    </label>
                    <div className="relative">
                      <div className="flex">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className="flex items-center px-2.5 py-3 bg-white/70 backdrop-blur-sm border border-gray-300/50 border-r-0 rounded-l-lg text-xs font-medium text-gray-700 hover:bg-white/90 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            disabled={isLoading}
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
                          placeholder={t('mobilePlaceholder')}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="password" className="block text-xs font-medium text-gray-800 mb-1">
                        {t('passwordLabel')} {t('required')}
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
                          placeholder={t('passwordPlaceholder')}
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-900 hover:text-purple-500 transition-colors"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-800 mb-1">
                        {t('confirmPasswordLabel')} {t('required')}
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
                          placeholder={t('confirmPasswordPlaceholder')}
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-900 hover:text-purple-500 transition-colors"
                          disabled={isLoading}
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
                        disabled={isLoading}
                      />
                      <span className="text-gray-700 leading-tight">
                        {t('agreeToTerms')}{' '}
                        <Link href="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
                          {t('termsOfService')}
                        </Link> {t('required')}
                      </span>
                    </label>
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreements.privacy}
                        onChange={() => handleAgreementChange('privacy')}
                        className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-1 mt-0.5 mr-2 flex-shrink-0"
                        required
                        disabled={isLoading}
                      />
                      <span className="text-gray-700 leading-tight">
                        {t('agreeToPrivacy')}{' '}
                        <Link href="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                          {t('privacyPolicy')}
                        </Link> {t('required')}
                      </span>
                    </label>
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreements.marketing}
                        onChange={() => handleAgreementChange('marketing')}
                        className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-1 mt-0.5 mr-2 flex-shrink-0"
                        disabled={isLoading}
                      />
                      <span className="text-gray-700 leading-tight">
                        {t('marketingCommunications')}
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        {t('creatingAccount')}...
                      </>
                    ) : (
                      t('createAccountButton')
                    )}
                  </button>
                </form>

                <div className="mt-3 text-center">
                  <Link href="/" className="text-gray-600 hover:text-purple-600 text-xs transition-colors">
                    Back to Home
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