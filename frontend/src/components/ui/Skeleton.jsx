'use client';

export default function Skeleton({ className = '', variant = 'rect', count = 1 }) {
  const variants = {
    rect: 'rounded',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`skeleton bg-gray-200 dark:bg-gray-700 ${variants[variant]} ${className}`}
      style={{ animationDelay: `${i * 0.1}s` }}
    />
  ));

  return count === 1 ? skeletons[0] : <>{skeletons}</>;
}
