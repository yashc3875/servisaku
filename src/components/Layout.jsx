import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '@/components/nav/BottomNav';
import TopNav from './TopNav';

export default function Layout() {
  const location = useLocation();
  const hideBottomNav = location.pathname.startsWith('/book/') || 
                        location.pathname.startsWith('/payment') || 
                        location.pathname.startsWith('/chat');

  return (
    <div className="font-inter min-h-screen bg-background">
      {/* Desktop Top Navigation */}
      <TopNav />

      {/* Main content */}
      <div className="pt-[72px]"> {/* Add padding-top to account for fixed TopNav */}
        <div
          className="mx-auto w-full"
          style={{ paddingBottom: hideBottomNav ? '0' : 'var(--nav-height, 4rem)' }}
        >
          <Outlet />
        </div>
      </div>

      {/* Bottom nav — mobile only */}
      {!hideBottomNav && (
        <div className="lg:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
}