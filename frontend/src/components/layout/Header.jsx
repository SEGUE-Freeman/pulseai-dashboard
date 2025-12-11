'use client';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import Dropdown from '../ui/Dropdown';
import Avatar from '../ui/Avatar';

export default function Header(){
  const { user, logout } = useAuth();

  const userMenuItems = [
    {
      label: 'Mon profil',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      onClick: () => window.location.href = '/dashboard/profile',
    },
    {
      label: 'Paramètres',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: () => {},
    },
    { divider: true },
    {
      label: 'Déconnexion',
      danger: true,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      onClick: logout,
    },
  ];
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pulsegreen to-pulseblue flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <div>
            <div className="text-lg font-semibold bg-gradient-to-r from-pulsegreen to-pulseblue bg-clip-text text-transparent">
              Tableau de bord
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Bienvenue, {user?.name || 'Hôpital'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </div>
                </div>
                <Avatar name={user?.name} size="md" />
              </button>
            }
            items={userMenuItems}
          />
        </div>
      </div>
    </header>
  );
}
