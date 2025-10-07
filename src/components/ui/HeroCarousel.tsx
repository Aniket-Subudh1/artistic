'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface Slide {
  image?: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  bgGradient: string;
  ctaText: string;
  ctaLink: string;
  category: string;
}

interface HeroCarouselProps {
  slides?: Slide[];
  autoSlideInterval?: number;
  manualPause?: number;
}

export default function HeroCarousel({
  slides = [],
  autoSlideInterval = 5000,
  manualPause = 10000,
}: HeroCarouselProps) {
  const SLIDE_W = 70; 
  const EDGE_GUTTER = (100 - SLIDE_W) / 2; 

  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const doc = document.documentElement;
 
    const attr =
      doc.getAttribute('dir') ||
      document.body.getAttribute('dir') ||
      window.getComputedStyle(doc).direction;
    setDir(attr === 'rtl' ? 'rtl' : 'ltr');
  }, []);

 
  const loopSlides = useMemo(() => {
    if (!slides.length) return [];
    const first = slides[0];
    const last = slides[slides.length - 1];
    return [last, ...slides, first];
  }, [slides]);

  const [index, setIndex] = useState(1);
  const [isAuto, setIsAuto] = useState(true);
  const [anim, setAnim] = useState(true);
  const railRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (!isAuto || loopSlides.length <= 1) return;
    const id = setInterval(() => setIndex((p) => p + 1), autoSlideInterval);
    return () => clearInterval(id);
  }, [isAuto, autoSlideInterval, loopSlides.length]);


  const onTransitionEnd = () => {
    if (!loopSlides.length) return;
   
    if (index === loopSlides.length - 1) {
      setAnim(false);
      setIndex(1);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnim(true))
      );
    }
    if (index === 0) {
      setAnim(false);
      setIndex(loopSlides.length - 2);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnim(true))
      );
    }
  };

  const next = () => {
    if (!loopSlides.length) return;
    setIsAuto(false);
    setIndex((p) => p + 1);
    setTimeout(() => setIsAuto(true), manualPause);
  };
  const prev = () => {
    if (!loopSlides.length) return;
    setIsAuto(false);
    setIndex((p) => p - 1);
    setTimeout(() => setIsAuto(true), manualPause);
  };

  const offset = index * SLIDE_W - EDGE_GUTTER;
  const translate =
    dir === 'rtl' ? `translateX(${offset}%)` : `translateX(-${offset}%)`;

  const realCount = slides.length;
  const realActive = realCount ? (index - 1 + realCount) % realCount : 0;

  const prevPosClass = dir === 'rtl' ? 'right-6' : 'left-6';
  const nextPosClass = dir === 'rtl' ? 'left-6' : 'right-6';

  return (
    <section className="py-8 pt-24 overflow-visible" dir={dir}>
      <div className="relative w-screen left-1/2 -translate-x-1/2">
        <div className="relative px-6">
          <button
            onClick={prev}
            className={`absolute ${prevPosClass} top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-20 shadow-xl border border-gray-200 group`}
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform duration-300" />
          </button>
          <button
            onClick={next}
            className={`absolute ${nextPosClass} top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-20 shadow-xl border border-gray-200 group`}
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform duration-300" />
          </button>

          <div
            ref={railRef}
            className={`flex ${anim ? 'transition-all duration-700 ease-in-out' : ''}`}
            style={{ width: '100vw', transform: translate }}
            onTransitionEnd={onTransitionEnd}
          >
            {loopSlides.map((slide, i) => (
              <div key={i} className="flex-shrink-0 w-[70vw]">
                <div className="mx-2 relative h-[300px] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer">
                  <div
                    className="w-full h-full relative"
                    style={{ background: slide.bgGradient }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60" />

                    <div className="absolute inset-0 overflow-hidden">
                      <div
                        className="absolute w-32 h-32 opacity-15 animate-spin-slow"
                        style={{
                          top: '15%',
                          right: '10%',
                          background:
                            'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent)',
                          borderRadius: '50%',
                        }}
                      />
                      <div
                        className="absolute w-24 h-24 opacity-20 animate-pulse-slow"
                        style={{
                          bottom: '15%',
                          left: '8%',
                          background:
                            'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)',
                          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                        }}
                      />
                    </div>

                    <div className="absolute inset-0 flex items-center px-8 z-10">
                      <div className="flex w-full items-center justify-between">
                        {/* left */}
                        <div className="text-white max-w-lg">
                          <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold tracking-wide uppercase border border-white/30">
                              {slide.category}
                            </span>
                          </div>

                          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                            <span className="block">{slide.title}</span>
                            <span className="block text-yellow-300">
                              {slide.titleHighlight}
                            </span>
                          </h2>

                          <p className="text-sm md:text-base mb-6 text-gray-200 leading-relaxed line-clamp-2">
                            {slide.subtitle}
                          </p>

                          <Link
                            href={slide.ctaLink}
                            className="inline-block group px-6 py-3 bg-white text-gray-900 rounded-full hover:bg-yellow-300 transition-all duration-500 font-semibold text-sm shadow-xl hover:scale-105"
                          >
                            <span className="group-hover:tracking-wider transition-all duration-300">
                              {slide.ctaText}
                            </span>
                          </Link>
                        </div>

                        <div className="hidden lg:flex items-center justify-center">
                          <div className="relative">
                            <div className="w-40 h-24 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center">
                              <div className="text-white/60 text-center">
                                <div className="w-12 h-12 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                                  <Star className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-medium">Featured</p>
                              </div>
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-bounce" />
                            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white/60 rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </div>

               
                  {i === index && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30">
                      <div className="h-full bg-white animate-progress-fill" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center mt-6 gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsAuto(false);
                    setIndex(i + 1); 
                    setTimeout(() => setIsAuto(true), manualPause);
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    i === realActive
                      ? 'w-8 h-2 bg-[#391C71]'
                      : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* component-scoped styles */}
      <style jsx>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-slow { 0%,100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.05); } }
        @keyframes progress-fill { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-progress-fill { animation: progress-fill 5s linear; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        /* keep side previews on smaller screens */
        @media (max-width: 768px) { .w-\[70vw\] { width: 85vw !important; } }
        @media (max-width: 640px) { .w-\[70vw\] { width: 92vw !important; } }
      `}</style>
    </section>
  );
}
