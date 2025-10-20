'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Phone, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Footer } from '@/components/main/Footer';
import { AuthService } from '@/services/auth.service';
import { CountryCodeDropdown, Country, getDefaultCountry, formatPhoneNumber } from '@/components/ui/CountryCodeDropdown';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const tErrors = useTranslations('auth.forgotPassword.errors');
  const tSuccess = useTranslations('auth.forgotPassword.success');
  const router = useRouter();
  
  const [phoneInput, setPhoneInput] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!phoneInput) {
      setError(tErrors('enterPhoneNumber'));
      return;
    }

    // Format the phone number with country code
    const fullPhoneNumber = formatPhoneNumber(selectedCountry.code, phoneInput);

    setIsLoading(true);

    try {
      await AuthService.sendForgotPasswordOtp(fullPhoneNumber);
      
      setSuccess(tSuccess('otpSent'));
      
      // Redirect to reset password page with phone number
      setTimeout(() => {
        router.push(`/auth/reset-password?phone=${encodeURIComponent(fullPhoneNumber)}`);
      }, 2000);
      
    } catch (error: any) {
      setError(error.message || tErrors('sendFailed'));
    } finally {
      setIsLoading(false);
    }
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
        <div className="w-full max-w-md">
          <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
            <div className="p-8 overflow-visible">
              {/* Logo */}
              <div className="text-center mb-8">
                <Image
                  src="/logo-main.webp"
                  alt="Artistic Logo"
                  width={100}
                  height={40}
                  className="h-10 w-auto mx-auto"
                />
              </div>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-purple-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('title')}
                </h1>
                <p className="text-gray-600 text-sm">
                  {t('subtitle')}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2 text-green-700">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone Number Input */}
                <div className="relative z-[100]">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-800 mb-2">
                    {t('phoneNumberLabel')}
                  </label>
                  <div className="flex relative">
                    <CountryCodeDropdown
                      selectedCountry={selectedCountry}
                      onCountrySelect={setSelectedCountry}
                      buttonClassName="border-r-0 py-4  rounded-r-none"
                    />
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder={t('phoneNumberPlaceholder')}
                      className="flex-1 px-4 py-3 border border-gray-300/50 border-l-0 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !phoneInput}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      {t('sending')}...
                    </>
                  ) : (
                    <>
                      {t('sendOtpButton')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-700 text-sm">
                  {t('rememberPassword')}{' '}
                  <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4 inline mr-1" />
                    {t('backToSignIn')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}