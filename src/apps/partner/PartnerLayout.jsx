import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '@/components/nav/BottomNav';
import PartnerTopNav from './PartnerTopNav';

export default function PartnerLayout() {
  const location = useLocation();

  const hideBottomNav = location.pathname.startsWith('/partner/job/') ||
                        location.pathname.startsWith('/chat') ||
                        location.pathname.startsWith('/partner/onboarding');

  return (
    <div className="font-inter min-h-screen bg-background">
      <PartnerTopNav />

      <div className="pt-[72px]">
        <div
          className="mx-auto w-full"
          style={{ paddingBottom: hideBottomNav ? '0' : 'var(--nav-height, 4rem)' }}
        >
          <Outlet />
        </div>
      </div>

      {!hideBottomNav && (
        <div className="lg:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
