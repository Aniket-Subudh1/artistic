'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'

const ArtisticPreloader = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    const isPageReload =
      navigationEntries.length > 0 &&
      (navigationEntries[0].type === 'reload' || navigationEntries[0].type === 'navigate')

    if (isPageReload || !sessionStorage.getItem('visited')) {
      setIsLoading(true)
      sessionStorage.setItem('visited', 'true')

      setTimeout(() => setShowContent(true), 300)
      setTimeout(() => setIsLoading(false), 2800)
    } else {
      setIsLoading(false)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-white via-purple-50/40 to-pink-50/30 overflow-hidden">
      {/* Soft Background Pattern */}
      <div className="absolute inset-0 opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25px 25px, rgba(57,28,113,0.15) 2px, transparent 2px),
              radial-gradient(circle at 75px 75px, rgba(91,44,135,0.1) 2px, transparent 2px)
            `,
            backgroundSize: '50px 50px, 100px 100px'
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-xl animate-floatSlow" />
      <div className="absolute bottom-32 right-24 w-24 h-24 bg-gradient-to-br from-orange-300/15 to-yellow-300/15 rounded-full blur-2xl animate-floatDelay" />
      <div className="absolute top-1/3 right-20 w-12 h-12 bg-gradient-to-br from-cyan-300/20 to-purple-300/20 rounded-full blur-xl animate-float" />

      {/* Main Glow */}
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-purple-200/20 via-pink-200/15 to-orange-200/20 rounded-full blur-3xl animate-glowPulse" />

      {/* Content */}
      <div className={`relative z-10 text-center transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Animated Rings */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-[8px] border-transparent border-t-purple-400 border-r-pink-400 rounded-full animate-ringSpin" />
          {/* Middle Ring */}
          <div className="absolute inset-6 border-[6px] border-transparent border-t-orange-400 border-l-purple-300 rounded-full animate-ringSpinSlow" />
          {/* Inner Ring */}
          <div className="absolute inset-12 border-[4px] border-transparent border-t-pink-300 border-b-purple-300 rounded-full animate-ringSpinFast" />

          {/* Logo Container */}
          <div className="relative w-48 h-24 flex items-center justify-center">
            {/* Logo Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/20 to-orange-400/30 rounded-2xl blur-xl animate-logoGlow" />
            
            {/* Logo */}
            <div className="relative animate-logoPop">
              <Image
                src="/logo.png"
                alt="Artistic Logo"
                width={180}
                height={90}
                className="relative z-10 drop-shadow-lg"
                priority
              />
              {/* Multi-color Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 via-purple-300/30 via-pink-300/30 via-orange-300/30 to-transparent animate-logoShimmer rounded-xl" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="mt-8 space-y-2">
          <h2 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent animate-textGradient">
              Creating Magic
            </span>
          </h2>
          <p className="text-gray-600 text-sm font-medium">Preparing your artistic experience...</p>
          
          {/* Loading Dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-dot1"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-dot2"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-dot3"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes glowPulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.4; }
          50% { transform: scale(1.1) rotate(180deg); opacity: 0.6; }
        }
        @keyframes ringSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ringSpinSlow {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes ringSpinFast {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(720deg); }
        }
        @keyframes logoShimmer {
          0% { transform: translateX(-120%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        @keyframes logoPop {
          0% { transform: scale(0.8) rotate(-5deg); opacity: 0; }
          50% { transform: scale(1.05) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes logoGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes textGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-30px) rotate(-90deg) scale(1.1); }
        }
        @keyframes floatDelay {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          33% { transform: translateY(-15px) rotate(120deg) scale(0.9); }
          66% { transform: translateY(-25px) rotate(240deg) scale(1.05); }
        }
        @keyframes dot1 {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes dot2 {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes dot3 {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        
        .animate-glowPulse { animation: glowPulse 6s ease-in-out infinite; }
        .animate-ringSpin { animation: ringSpin 2s linear infinite; }
        .animate-ringSpinSlow { animation: ringSpinSlow 4s linear infinite; }
        .animate-ringSpinFast { animation: ringSpinFast 1.5s linear infinite; }
        .animate-logoShimmer { animation: logoShimmer 3s ease-in-out infinite 0.8s; }
        .animate-logoPop { animation: logoPop 0.8s ease-out forwards; }
        .animate-logoGlow { animation: logoGlow 3s ease-in-out infinite; }
        .animate-textGradient { 
          animation: textGradient 3s ease-in-out infinite;
          background-size: 200% 200%;
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-floatSlow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-floatDelay { animation: floatDelay 5s ease-in-out infinite 1s; }
        .animate-dot1 { animation: dot1 1.4s ease-in-out infinite; }
        .animate-dot2 { animation: dot2 1.4s ease-in-out infinite 0.2s; }
        .animate-dot3 { animation: dot3 1.4s ease-in-out infinite 0.4s; }
      `}</style>
    </div>
  )
}

export default ArtisticPreloader