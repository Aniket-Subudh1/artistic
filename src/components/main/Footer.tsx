'use client'

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Instagram } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  const t = useTranslations('footer');
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Subscribe email:', email);
    setEmail('');
    // Could show a success toast here
  };

  return (
    <footer className="bg-gradient-to-br from-purple-900 via-[#391C71] to-[#391C72] text-white z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo-welcome.webp"
                alt='Artistic Logo'
                height={60}
                width={120}
                className="h-auto w-auto"
              />
            </Link>
            <p className="text-purple-200 text-sm mb-4">
              {t('tagline')}
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://www.instagram.com/artistic__global/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Discover Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('discover')}</h3>
            <ul className="space-y-3 text-purple-200 text-sm">
              <li>
                <Link href="/events" className="hover:text-white transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">{t('events')}</span>
                </Link>
              </li>
              <li>
                <Link href="/artists" className="hover:text-white transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">{t('artists')}</span>
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-white transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">{t('equipment')}</span>
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-white transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">{t('calendar')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('company')}</h3>
            <ul className="space-y-3 text-purple-200 text-sm">
              <li>
                <Link href="/join-us" className="hover:text-white transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">{t('joinUs')}</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">{t('terms')}</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">{t('privacy')}</span>
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">{t('cookies')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('subscribe')}</h3>
            <p className="text-purple-200 text-sm mb-4">
              {t('subscribeDesc')}
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                required
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-white text-purple-900 rounded-lg font-medium hover:bg-purple-50 transition-all duration-300 hover:shadow-lg"
              >
                {t('subscribeButton')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-purple-200 text-sm text-center md:text-left">
              {t('copyright')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-purple-200 text-sm">
              <Link href="/terms" className="hover:text-white transition-colors">{t('terms')}</Link>
              <span className="text-purple-400">•</span>
              <Link href="/privacy" className="hover:text-white transition-colors">{t('privacy')}</Link>
              <span className="text-purple-400">•</span>
              <Link href="/cookies" className="hover:text-white transition-colors">{t('cookies')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}