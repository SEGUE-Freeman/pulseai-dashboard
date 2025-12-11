export default function Card({children, title, value, color, className = ''}) {
  const colorClasses = {
    blue: 'text-pulseblue dark:text-blue-400',
    green: 'text-pulsegreen dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400'
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-4 transition-all duration-200 ${className}`}>
      {title && (
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          {title}
        </h3>
      )}
      {value && (
        <div className={`text-3xl font-bold ${colorClasses[color] || 'text-pulsegreen dark:text-green-400'}`}>
          {value}
        </div>
      )}
      {children}
    </div>
  );
}
