interface LogoProps {
  variant?: 'dark' | 'light'
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  const gold = '#c9a84c'
  const goldFaint = '#c9a84c88'

  return (
    <svg
      viewBox="0 0 200 62"
      className={className}
      aria-label="Niroté"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* NR Monogram */}
      <text
        x="100" y="23"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="21" fontWeight="700"
        fill={gold}
        textAnchor="middle"
        letterSpacing="10"
      >NR</text>

      {/* Decorative lines with centre diamond */}
      <line x1="16" y1="30" x2="76" y2="30" stroke={gold} strokeWidth="0.5" opacity="0.65"/>
      <text x="100" y="34" fontFamily="serif" fontSize="7" fill={gold} textAnchor="middle" opacity="0.9">✦</text>
      <line x1="124" y1="30" x2="184" y2="30" stroke={gold} strokeWidth="0.5" opacity="0.65"/>

      {/* NIROTÉ */}
      <text
        x="100" y="47"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="13.5" fontWeight="700"
        fill={gold}
        textAnchor="middle"
        letterSpacing="5"
      >NIROTÉ</text>

      {/* TIMELESS LUXURY */}
      <text
        x="100" y="58"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="5.8" fontWeight="400"
        fill={goldFaint}
        textAnchor="middle"
        letterSpacing="3.5"
      >TIMELESS LUXURY</text>
    </svg>
  )
}
