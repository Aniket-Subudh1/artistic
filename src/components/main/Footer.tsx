'use client'

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  const t = useTranslations('footer');
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscribe email:', email);
    setEmail('');
  };

  return (
    <footer className="bg-gradient-to-br from-purple-900 via-[#391C71] to-[#391C72] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo-welcome.webp"
                alt='logo'
                height={60}
                width={120}
              />
            </div>
            <p className="text-purple-200 text-sm mb-4">
              {t('tagline')}
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Discover Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('discover')}</h3>
            <ul className="space-y-2 text-purple-200 text-sm">
              <li><Link href="/events" className="hover:text-white transition-colors">{t('events')}</Link></li>
              <li><Link href="/artists" className="hover:text-white transition-colors">{t('artists')}</Link></li>
              <li><Link href="/equipments" className="hover:text-white transition-colors">{t('equipment')}</Link></li>
              <li><Link href="/workshops" className="hover:text-white transition-colors">{t('workshops')}</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('company')}</h3>
            <ul className="space-y-2 text-purple-200 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">{t('aboutUs')}</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">{t('careers')}</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">{t('blog')}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{t('contact')}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('subscribe')}</h3>
            <p className="text-purple-200 text-sm mb-4">
              {t('subscribeDesc')}
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:border-white/40"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white text-purple-900 rounded-lg font-medium hover:bg-purple-50 transition-colors"
              >
                {t('subscribeButton')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-purple-200 text-sm mb-4 md:mb-0">
            {t('copyright')}
          </p>
          <div className="flex space-x-6 text-purple-200 text-sm">
            <Link href="/terms" className="hover:text-white transition-colors">{t('terms')}</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">{t('privacy')}</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">{t('cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}