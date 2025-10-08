import React from 'react'
import Image from 'next/image'

const TitleTag = () => {
  return (
    <div className="w-full flex items-center justify-between px-10">
      {/* Left design */}
      <Image
        src="/design.png"
        alt="Left Design"
        width={200}
        height={200}
        className="select-none opacity-90"
      />

      {/* Center Logo */}
      <Image
        src="/Logo.svg"
        alt="Center Logo"
        width={250}
        height={250}
        className="select-none opacity-100"
      />

      {/* Right design */}
      <Image
        src="/design.png"
        alt="Right Design"
        width={200}
        height={200}
        className="select-none opacity-90"
      />
    </div>
  )
}

export default TitleTag
