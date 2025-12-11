import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Header from './Header';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <MobileSidebar />
      
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        <Header />
        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
