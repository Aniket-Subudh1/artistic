import React from 'react';

interface FlagImageProps {
  countryCode: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FlagImage({ countryCode, className = '', size = 'sm' }: FlagImageProps) {
  const sizeClasses = {
    sm: 'w-5 h-4',
    md: 'w-8 h-6',
    lg: 'w-12 h-9'
  };

  // For now, we'll create SVG flags for common countries
  // This can be expanded to use a flag API service later
  const getFlagSVG = (code: string): React.ReactElement => {
    const flags: Record<string, React.ReactElement> = {
      'IN': (
        <svg viewBox="0 0 900 600" className={`${sizeClasses[size]} ${className}`}>
          {/* Saffron stripe */}
          <rect width="900" height="200" fill="#FF9933"/>
          {/* White stripe */}
          <rect y="200" width="900" height="200" fill="#FFFFFF"/>
          {/* Green stripe */}
          <rect y="400" width="900" height="200" fill="#138808"/>
          {/* Ashoka Chakra */}
          <g transform="translate(450,300)">
            <circle r="80" fill="none" stroke="#000080" strokeWidth="4"/>
            {/* 24 spokes */}
            {Array.from({length: 24}, (_, i) => (
              <line 
                key={i}
                x1="0" y1="-76" x2="0" y2="-40" 
                stroke="#000080" 
                strokeWidth="3"
                transform={`rotate(${i * 15})`}
              />
            ))}
            {/* Inner circle lines */}
            {Array.from({length: 24}, (_, i) => (
              <line 
                key={`inner-${i}`}
                x1="0" y1="-40" x2="0" y2="-20" 
                stroke="#000080" 
                strokeWidth="2"
                transform={`rotate(${i * 15})`}
              />
            ))}
            {/* Center circle */}
            <circle r="8" fill="#000080"/>
          </g>
        </svg>
      ),
      'KW': (
        <svg viewBox="0 0 900 600" className={`${sizeClasses[size]} ${className}`}>
          {/* Green stripe */}
          <rect width="900" height="200" fill="#007A3D"/>
          {/* White stripe */}
          <rect y="200" width="900" height="200" fill="#FFFFFF"/>
          {/* Red stripe */}
          <rect y="400" width="900" height="200" fill="#CE1126"/>
          {/* Black trapezoid */}
          <polygon points="0,0 0,600 270,450 270,150" fill="#000000"/>
        </svg>
      ),
      'US': (
        <svg viewBox="0 0 900 600" className={`${sizeClasses[size]} ${className}`}>
          {/* Red and white stripes */}
          {Array.from({length: 13}, (_, i) => (
            <rect key={i} y={i * 46.15} width="900" height="46.15" fill={i % 2 === 0 ? "#B22234" : "#FFFFFF"}/>
          ))}
          {/* Blue canton */}
          <rect width="360" height="338" fill="#3C3B6E"/>
          {/* Stars would be complex, so we'll add a simplified version */}
          <g fill="#FFFFFF">
            {Array.from({length: 50}, (_, i) => {
              const row = Math.floor(i / 10);
              const col = i % 10;
              const isOddRow = row % 2 === 1;
              const x = isOddRow ? 18 + col * 36 : 36 + col * 36;
              const y = 30 + row * 33;
              return x < 350 && y < 320 ? (
                <circle key={i} cx={x} cy={y} r="8" />
              ) : null;
            })}
          </g>
        </svg>
      ),
      'GB': (
        <svg viewBox="0 0 900 600" className={`${sizeClasses[size]} ${className}`}>
          <rect width="900" height="600" fill="#012169"/>
          <g stroke="#FFFFFF" strokeWidth="60">
            <path d="M0,0 L900,600 M900,0 L0,600"/>
          </g>
          <g stroke="#C8102E" strokeWidth="40">
            <path d="M0,0 L900,600 M900,0 L0,600"/>
          </g>
          <path d="M450,0 V600 M0,300 H900" stroke="#FFFFFF" strokeWidth="100"/>
          <path d="M450,0 V600 M0,300 H900" stroke="#C8102E" strokeWidth="60"/>
        </svg>
      ),
      'AE': (
        <svg viewBox="0 0 900 600" className={`${sizeClasses[size]} ${className}`}>
          <rect width="900" height="600" fill="#fff"/>
          <rect width="900" height="200" fill="#00732F"/>
          <rect y="200" width="900" height="200" fill="#FFFFFF"/>
          <rect y="400" width="900" height="200" fill="#000000"/>
          <rect width="225" height="600" fill="#FF0000"/>
        </svg>
      ),
      'SA': (
        <svg viewBox="0 0 900 600" className={`${sizeClasses[size]} ${className}`}>
          <rect width="900" height="600" fill="#006C35"/>
          <g fill="#FFFFFF" transform="translate(450,300)">
            <text textAnchor="middle" fontSize="80" fontFamily="Arial">المملكة العربية السعودية</text>
          </g>
        </svg>
      )
    };

    return flags[code] || (
      <svg viewBox="0 0 900 600" className={`${sizeClasses[size]} ${className}`}>
        <rect width="900" height="600" fill="#6B7280"/>
        <text x="450" y="320" textAnchor="middle" fill="white" fontSize="120" fontFamily="Arial">
          {code}
        </text>
      </svg>
    );
  };

  return (
    <div className="inline-flex items-center justify-center rounded-sm overflow-hidden border border-gray-200 shadow-sm">
      {getFlagSVG(countryCode.toUpperCase())}
    </div>
  );
}