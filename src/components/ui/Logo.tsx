import type { SVGProps } from 'react';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { width: 96,  height: 44, monoW: 36, monoH: 28, textSize: 5.5, textGap: 4 },
  md: { width: 128, height: 58, monoW: 48, monoH: 38, textSize: 6.5, textGap: 5 },
  lg: { width: 172, height: 78, monoW: 64, monoH: 50, textSize: 8,   textGap: 7 },
};

export default function Logo({ variant = 'dark', size = 'md', className }: LogoProps) {
  const s = sizes[size];
  const textColor = variant === 'light' ? '#FDFAF7' : '#2A2421';
  const subtitleColor = variant === 'light' ? '#EAE1D6' : '#5B4638';

  // Monogram area: M + diamond + E stacked vertically with text below
  const mW = s.monoW;
  const mH = s.monoH;
  // Diamond sits centered between M and E
  const dSize = mH * 0.18; // diamond half-diagonal
  const midX = mW / 2;
  const midY = mH / 2;

  // Text rows below monogram
  const line1Y = mH + s.textGap + s.textSize;
  const line2Y = line1Y + s.textSize * 1.4;

  const totalH = line2Y + 2;

  return (
    <svg
      width={s.width}
      height={totalH}
      viewBox={`0 0 ${s.width} ${totalH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ME Producciones — Mónica Espinoza Producciones"
      role="img"
    >
      <defs>
        <linearGradient id={`meGrad-${variant}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C47A5A" />
          <stop offset="100%" stopColor="#A56E52" />
        </linearGradient>
      </defs>

      {/* ── Monogram group — centered horizontally ── */}
      <g transform={`translate(${(s.width - mW) / 2}, 0)`}>

        {/* M — left half of monogram */}
        {/* Bold M drawn as a filled path for a condensed, editorial feel */}
        <path
          d={`
            M 0 ${mH}
            L 0 0
            L ${midX * 0.55} ${mH * 0.52}
            L ${midX} ${mH * 0.18}
            L ${midX * 1.45} ${mH * 0.52}
            L ${mW} 0
            L ${mW} ${mH}
            L ${mW * 0.82} ${mH}
            L ${mW * 0.82} ${mH * 0.38}
            L ${midX * 1.28} ${mH * 0.72}
            L ${midX} ${mH * 0.38}
            L ${midX * 0.72} ${mH * 0.72}
            L ${mW * 0.18} ${mH * 0.38}
            L ${mW * 0.18} ${mH}
            Z
          `}
          fill={`url(#meGrad-${variant}-${size})`}
        />

        {/* Diamond — centered cutout/overlay accent */}
        <polygon
          points={`
            ${midX},${midY - dSize}
            ${midX + dSize * 0.7},${midY}
            ${midX},${midY + dSize}
            ${midX - dSize * 0.7},${midY}
          `}
          fill={variant === 'light' ? '#2A2421' : '#FDFAF7'}
          opacity="0.85"
        />

        {/* Inner diamond highlight */}
        <polygon
          points={`
            ${midX},${midY - dSize * 0.45}
            ${midX + dSize * 0.32},${midY}
            ${midX},${midY + dSize * 0.45}
            ${midX - dSize * 0.32},${midY}
          `}
          fill="#A56E52"
          opacity="0.6"
        />
      </g>

      {/* ── Text below monogram ── */}
      {/* "MÓNICA ESPINOZA" */}
      <text
        x={s.width / 2}
        y={mH + s.textGap + s.textSize}
        textAnchor="middle"
        fontFamily="'Jost', system-ui, sans-serif"
        fontSize={s.textSize}
        fontWeight="500"
        letterSpacing={s.textSize * 0.35}
        fill={textColor}
        style={{ textTransform: 'uppercase' }}
      >
        MÓNICA ESPINOZA
      </text>

      {/* "PRODUCCIONES" — slightly lighter */}
      <text
        x={s.width / 2}
        y={line2Y}
        textAnchor="middle"
        fontFamily="'Jost', system-ui, sans-serif"
        fontSize={s.textSize * 0.88}
        fontWeight="400"
        letterSpacing={s.textSize * 0.55}
        fill={subtitleColor}
        style={{ textTransform: 'uppercase' }}
      >
        PRODUCCIONES
      </text>
    </svg>
  );
}
