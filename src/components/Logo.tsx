interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className = "" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="108" fill="url(#logo-bg)" />
      <circle cx="256" cy="240" r="140" fill="rgba(0,0,0,0.25)" />
      <circle cx="256" cy="240" r="130" fill="#1a1a2e" />
      <circle cx="205" cy="220" r="28" fill="url(#logo-bg)" />
      <circle cx="307" cy="220" r="28" fill="url(#logo-bg)" />
      <circle cx="213" cy="212" r="10" fill="#ffffff" />
      <circle cx="315" cy="212" r="10" fill="#ffffff" />
      <path
        d="M 200 270 Q 256 320 312 270"
        stroke="url(#logo-bg)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      <line
        x1="256" y1="110" x2="256" y2="70"
        stroke="url(#logo-bg)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx="256" cy="60" r="14" fill="url(#logo-bg)" />
      <path
        d="M 230 370 L 270 370 L 250 400 L 280 400 L 240 445 L 252 410 L 225 410 Z"
        fill="url(#logo-bg)"
      />
    </svg>
  );
}
