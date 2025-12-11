export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-pulsegreen to-green-600 hover:from-green-600 hover:to-pulsegreen text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-pulseblue to-blue-600 hover:from-blue-600 hover:to-pulseblue text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-pulsegreen text-pulsegreen hover:bg-pulsegreen hover:text-white dark:border-green-400 dark:text-green-400 dark:hover:bg-green-400 dark:hover:text-white',
    ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const baseClasses = 'rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Chargement...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
