'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Phone, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { Footer } from '@/components/main/Footer';
import { AuthService } from '@/services/auth.service';

export default function VerifyOTPPage() {
  const t = useTranslations('auth.verifyOtp');
  const tErrors = useTranslations('auth.verifyOtp.errors');
  const tSuccess = useTranslations('auth.verifyOtp.success');
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phone') || '';
  const returnUrl = searchParams.get('returnUrl') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError(tErrors('enterCompleteOtp'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.verifyOtp(phoneNumber, otpCode);
      
      // Store auth data if verification successful
      AuthService.storeAuthData(response.access_token, response.user);
      
      setSuccess(tSuccess('phoneVerified'));
      
      // Redirect back to where the user came from if provided; otherwise go home
      setTimeout(() => {
        if (returnUrl) {
          router.push(returnUrl);
        } else {
          router.push('/');
        }
      }, 2000);
      
    } catch (error: any) {
      setError(error.message || tErrors('invalidOtp'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setError('');
    setSuccess('');
    
    try {
      await AuthService.resendOtp(phoneNumber);
      
      setSuccess(tSuccess('otpSent'));
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
    } catch (error: any) {
      setError(tErrors('resendFailed'));
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
          <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8">
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
                <p className="text-gray-900 font-medium">
                  {phoneNumber}
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
                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-3 text-center">
                    {t('enterCodeLabel')}
                  </label>
                  <div className="flex justify-center space-x-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      {t('resendOtp')}
                    </button>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      {t('resendOtpIn')} {countdown}{t('seconds')}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      {t('verifying')}...
                    </>
                  ) : (
                    <>
                      {t('verifyButton')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-700 text-sm">
                  {t('wrongNumber')}{' '}
                  <Link href={`/auth/signup${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                    {t('goBack')}
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