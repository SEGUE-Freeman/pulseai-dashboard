'use client';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function HistoryChart({ data = [] }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Détecter le mode sombre
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const chartData = {
    labels: data.map(d => d.ts),
    datasets: [
      {
        label: 'Lits disponibles',
        data: data.map(d => d.beds_available),
        borderColor: '#10b981',
        backgroundColor: isDark 
          ? 'rgba(16, 185, 129, 0.1)'
          : 'rgba(16, 185, 129, 0.2)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Lits total',
        data: data.map(d => d.beds_total),
        borderColor: '#3b82f6',
        backgroundColor: isDark
          ? 'rgba(59, 130, 246, 0.1)'
          : 'rgba(59, 130, 246, 0.2)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: isDark ? '#e5e7eb' : '#374151',
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#f3f4f6' : '#111827',
        bodyColor: isDark ? '#e5e7eb' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y} lits`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'dd MMM',
          },
        },
        grid: {
          display: true,
          color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: {
            size: 11,
          },
          callback: function (value) {
            return value + ' lits';
          },
        },
      },
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
