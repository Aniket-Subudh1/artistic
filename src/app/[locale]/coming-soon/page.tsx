'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Clock, Mail, Bell, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';

export default function ComingSoonPage() {
  const t = useTranslations();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Launch date - 3 days from now
  const launchDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).getTime();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      // Here you would typically send the email to your backend
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
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
      
      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        {/* Logo Section */}
        <div className="mb-12">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
            <div className="relative z-10 text-center">
              <div className="relative group mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-all duration-500" />
                <Image
                  src="/logo-main.webp"
                  alt="Artistic Logo"
                  height={60}
                  width={140}
                  className="relative transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="w-full max-w-4xl">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 md:p-12 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#391C71]/10 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-tr-full"></div>
            
            <div className="relative z-10 text-center">
              {/* Main Heading */}
              <div className="mb-12">
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  {t('comingSoon.title').split(' ')[0]}
                  <span className="block bg-gradient-to-r from-[#391C71] to-[#5B2C87] bg-clip-text text-transparent">
                    {t('comingSoon.title').split(' ')[1] || 'Soon'}
                  </span>
                </h1>
                <div className="flex items-center justify-center mb-8">
                  <Sparkles className="w-8 h-8 text-[#391C71] mr-3 animate-pulse" />
                  <p className="text-gray-700 text-xl md:text-2xl font-medium">
                    {t('comingSoon.subtitle')}
                  </p>
                  <Sparkles className="w-8 h-8 text-[#391C71] ml-3 animate-pulse" />
                </div>
                <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                  {t('comingSoon.description')}
                </p>
              </div>

              {/* Countdown Timer */}
              <div className="mb-12">
                <div className="flex items-center justify-center mb-8">
                  <Clock className="w-6 h-6 text-[#391C71] mr-2" />
                  <span className="text-gray-700 text-lg font-semibold">{t('comingSoon.launchCountdown')}</span>
                </div>
                <div className="grid grid-cols-4 gap-4 md:gap-8">
                  {[
                    { label: t('comingSoon.days'), value: timeLeft.days },
                    { label: t('comingSoon.hours'), value: timeLeft.hours },
                    { label: t('comingSoon.minutes'), value: timeLeft.minutes },
                    { label: t('comingSoon.seconds'), value: timeLeft.seconds },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className="relative group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/40 hover:border-[#391C71]/30 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl">
                        <div className="text-2xl md:text-4xl font-bold text-[#391C71] mb-2 font-mono">
                          {item.value.toString().padStart(2, '0')}
                        </div>
                        <div className="text-gray-600 text-xs md:text-sm uppercase tracking-wider font-medium">
                          {item.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Subscription */}
              <div className="mb-12 max-w-md mx-auto">
                <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/40 shadow-lg">
                  {!isSubscribed ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                      <div className="text-center mb-6">
                        <Bell className="w-8 h-8 text-[#391C71] mx-auto mb-3" />
                        <h3 className="text-gray-900 text-xl font-bold mb-2">
                          {t('comingSoon.beFirstToKnow')}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {t('comingSoon.getNotified')}
                        </p>
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('comingSoon.emailPlaceholder')}
                          required
                          className="w-full pl-12 pr-4 py-4 bg-white/70 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#391C71] focus:bg-white transition-all duration-300"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white py-4 rounded-xl font-semibold hover:from-[#5B2C87] hover:to-[#7C3A9D] transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl"
                      >
                        {t('comingSoon.notifyMe')}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                    </form>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-gray-900 text-xl font-bold mb-2">
                        {t('comingSoon.allSet')}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {t('comingSoon.thanksSubscribing')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  {
                    icon: '🎨',
                    title: t('comingSoon.features.artisticEvents.title'),
                    description: t('comingSoon.features.artisticEvents.description')
                  },
                  {
                    icon: '📦',
                    title: t('comingSoon.features.equipmentPackages.title'),
                    description: t('comingSoon.features.equipmentPackages.description')
                  },
                  {
                    icon: '⭐',
                    title: t('comingSoon.features.premiumExperience.title'),
                    description: t('comingSoon.features.premiumExperience.description')
                  }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 border border-white/40 hover:border-[#391C71]/30 transition-all duration-300 text-center group hover:shadow-lg"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h4 className="text-gray-900 font-bold text-lg mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>

              {/* Back to Home */}
              <Link
                href="/"
                className="inline-flex items-center bg-white/90 backdrop-blur-sm text-[#391C71] hover:text-[#5B2C87] px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold group"
              >
                {t('comingSoon.backToHome')}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>

      <Footer />
    </div>
  );
}