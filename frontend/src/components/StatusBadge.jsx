import React from 'react';
import { getAQILevel } from '../utils/aqiColors';

export default function StatusBadge({ status, aqi, size = 'normal' }) {
  const level = getAQILevel(status || aqi);

  const sizeClasses = size === 'large'
    ? 'px-3.5 py-1.5 text-sm font-semibold'
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${level.badgeBg} ${level.badgeText} ${level.border} ${sizeClasses}`}
      title={level.healthAdvice}
    >
      <span className={`h-2 w-2 rounded-full ${level.dot} animate-pulse`} />
      {level.label}
    </span>
  );
}
