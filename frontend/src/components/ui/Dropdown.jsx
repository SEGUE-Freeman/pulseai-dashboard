'use client';
import { useState, useRef, useEffect } from 'react';

export default function Dropdown({ trigger, items, align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={`absolute ${alignmentClasses[align]} mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 animate-slide-down`}
        >
          {items.map((item, index) => (
            <div key={index}>
              {item.divider ? (
                <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
              ) : (
                <button
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  disabled={item.disabled}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${item.danger ? 'text-red-600 dark:text-red-400' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                    <span>{item.label}</span>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
