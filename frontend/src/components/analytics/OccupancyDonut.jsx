'use client';
import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OccupancyDonut({ available = 0, occupied = 0 }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const total = available + occupied;
  const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;

  const data = {
    labels: ['Disponibles', 'Occupés'],
    datasets: [
      {
        data: [available, occupied],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          '#10b981',
          '#ef4444',
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: isDark ? '#e5e7eb' : '#374151',
          padding: 15,
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#f3f4f6' : '#111827',
        bodyColor: isDark ? '#e5e7eb' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} lits (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div className="relative h-64 w-full">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-pulsegreen to-pulseblue bg-clip-text text-transparent">
            {occupancyRate}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Occupation</div>
        </div>
      </div>
    </div>
  );
}
