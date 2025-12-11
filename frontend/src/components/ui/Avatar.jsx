'use client';

export default function Avatar({ src, alt, name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${sizes[size]} ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={alt || name} 
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-pulsegreen to-pulseblue flex items-center justify-center text-white font-semibold">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
