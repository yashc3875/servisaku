import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/nav/BottomNav';
import TopNav from './TopNav';

export default function Layout() {
  return (
    <div className="font-inter min-h-screen bg-background">
      {/* Desktop Top Navigation */}
      <TopNav />

      {/* Main content */}
      <div className="pt-[72px]"> {/* Add padding-top to account for fixed TopNav */}
        <div
          className="mx-auto w-full"
          style={{ paddingBottom: 'var(--nav-height, 4rem)' }}
        >
          <Outlet />
        </div>
      </div>

      {/* Bottom nav — mobile only */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}