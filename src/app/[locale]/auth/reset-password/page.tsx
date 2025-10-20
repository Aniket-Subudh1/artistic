'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Phone, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Footer } from '@/components/main/Footer';
import { AuthService } from '@/services/auth.service';

export default function ResetPasswordPage() {
  const t = useTranslations('auth.resetPassword');
  const tErrors = useTranslations('auth.resetPassword.errors');
  const tSuccess = useTranslations('auth.resetPassword.success');
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phone') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [step, setStep] = useState(1); // 1: OTP verification, 2: New password

  useEffect(() => {
    if (!phoneNumber) {
      router.push('/auth/forgot-password');
      return;
    }
  }, [phoneNumber, router]);

  useEffect(() => {
    if (countdown > 0 && step === 1) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 1) {
      setCanResend(true);
    }
  }, [countdown, step]);

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

  const handleVerifyOtp = async (e: React.FormEvent) => {
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
      await AuthService.verifyForgotPasswordOtp(phoneNumber, otpCode);
      
      setSuccess(tSuccess('otpVerified'));
      
      // Move to password reset step
      setTimeout(() => {
        setStep(2);
        setError('');
        setSuccess('');
      }, 1000);
      
    } catch (error: any) {
      setError(error.message || tErrors('invalidOtp'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError(tErrors('fillAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(tErrors('passwordsNotMatch'));
      return;
    }

    if (newPassword.length < 8) {
      setError(tErrors('passwordTooShort'));
      return;
    }

    const otpCode = otp.join('');
    setIsLoading(true);

    try {
      await AuthService.resetPassword(phoneNumber, otpCode, newPassword);
      
      setSuccess(tSuccess('passwordReset'));
      
      // Redirect to signin page
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
      
    } catch (error: any) {
      setError(error.message || tErrors('resetFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setError('');
    setSuccess('');
    
    try {
      await AuthService.sendForgotPasswordOtp(phoneNumber);
      
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
                  {step === 1 ? (
                    <Phone className="w-8 h-8 text-purple-600" />
                  ) : (
                    <Lock className="w-8 h-8 text-purple-600" />
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {step === 1 ? t('verifyTitle') : t('newPasswordTitle')}
                </h1>
                <p className="text-gray-600 text-sm">
                  {step === 1 ? t('verifySubtitle') : t('newPasswordSubtitle')}
                </p>
                {step === 1 && (
                  <p className="text-gray-900 font-medium mt-2">
                    {phoneNumber}
                  </p>
                )}
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

              {step === 1 ? (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
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
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-800 mb-2">
                      {t('newPasswordLabel')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-800" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                        placeholder={t('newPasswordPlaceholder')}
                        required
                        disabled={isLoading}
                        minLength={8}
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

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-800 mb-2">
                      {t('confirmPasswordLabel')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-800" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                        placeholder={t('confirmPasswordPlaceholder')}
                        required
                        disabled={isLoading}
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-500 transition-colors"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !newPassword || !confirmPassword}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        {t('resetting')}...
                      </>
                    ) : (
                      <>
                        {t('resetPasswordButton')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              )}

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