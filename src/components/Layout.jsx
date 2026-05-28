import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import SideNav from './SideNav';

export default function Layout() {
  return (
    <div className="font-inter min-h-screen bg-background">
      {/* Desktop sidebar */}
      <SideNav />

      {/* Main content — offset by sidebar on lg+ */}
      <div className="lg:pl-64">
        <div
          className="mx-auto w-full
            max-w-lg
            md:max-w-2xl
            lg:max-w-none lg:px-0"
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