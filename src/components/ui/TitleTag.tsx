import React from 'react'
import Image from 'next/image';

const TitleTag = () => {
  return (
    <div className="w-full h-auto flex items-center mb-10 z-50 bg-white/40 backdrop-blur-md justify-center -mb-10 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3">
      <Image
        src="/ld.png"
        alt="Center Logo"
        width={3000}
        height={3000}
        className="select-none w-full max-h-[150px] object-contain"
        priority
      />
    </div>
  )
}

export default TitleTag