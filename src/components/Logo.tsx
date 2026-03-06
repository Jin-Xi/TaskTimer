import React from 'react';

interface LogoProps {
  variant?: 'icon' | 'horizontal' | 'full';
  size?: number;
  className?: string;
}

/**
 * ChronoFlow Logo Component - Simple Circular Design
 *
 * @param variant - 'icon' | 'horizontal' | 'full'
 * @param size - Width in pixels (height is auto-calculated)
 * @param className - Additional CSS classes
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'icon',
  size = 40,
  className = ''
}) => {
  const dimensions = {
    icon: { width: size, height: size },
    horizontal: { width: size * 3, height: size },
    full: { width: size * 3.5, height: size * 3.5 }
  };

  const { width, height } = dimensions[variant];

  // Simple circular icon - green circle with stylized hourglass
  const CircularIcon = () => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Green Circle Background */}
      <circle cx="32" cy="32" r="30" className="fill-green-400 dark:fill-green-300" />

      {/* Simple Hourglass in White */}
      <path
        d="M24 18L40 18L32 32L40 46L24 46L32 32Z"
        className="fill-white"
      />
    </svg>
  );

  // Icon variant - Just the circle
  if (variant === 'icon') {
    return <CircularIcon />;
  }

  // Horizontal variant - Circle + Text side by side
  if (variant === 'horizontal') {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Green Circle */}
        <circle cx="25" cy="25" r="22" className="fill-green-400 dark:fill-green-300" />

        {/* Simple Hourglass */}
        <path
          d="M18 17L32 17L25 25L32 33L18 33L25 25Z"
          className="fill-white"
        />

        {/* Text */}
        <text x="55" y="33" fontFamily="'Inter', -apple-system, sans-serif" fontSize="20" fontWeight="700" className="fill-neutral-900 dark:fill-neutral-100">
          Chrono
          <tspan className="fill-green-400 dark:fill-green-300">Flow</tspan>
        </text>
      </svg>
    );
  }

  // Full variant - Centered with tagline
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Green Circle */}
      <circle cx="100" cy="80" r="60" className="fill-green-400 dark:fill-green-300" />

      {/* Simple Hourglass */}
      <path
        d="M75 55L125 55L100 80L125 105L75 105L100 80Z"
        className="fill-white"
      />

      {/* Text */}
      <text x="100" y="165" textAnchor="middle" fontFamily="'Inter', -apple-system, sans-serif" fontSize="28" fontWeight="800" className="fill-neutral-900 dark:fill-neutral-100">
        Chrono
        <tspan className="fill-green-400 dark:fill-green-300">Flow</tspan>
      </text>

      {/* Tagline */}
      <text x="100" y="188" textAnchor="middle" fontFamily="'Inter', -apple-system, sans-serif" fontSize="11" fontWeight="500" className="fill-neutral-800 dark:fill-neutral-600" letterSpacing="2">
        AI TASK TIMER
      </text>
    </svg>
  );
};

export default Logo;
