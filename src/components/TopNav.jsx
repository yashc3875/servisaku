import { Link, useLocation } from 'react-router-dom';
import { Hexagon, MapPin, ShoppingCart, ChevronDown, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function TopNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b",
        scrolled ? "bg-surface/95 backdrop-blur-md border-hairline/20 shadow-sm py-3" : "bg-surface border-transparent py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center">
            <img src="/img/brand-logo.png" className="h-9 w-auto object-contain" alt="ServisAku Logo" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <p className="font-extrabold text-[24px] leading-none tracking-tight">
              <span className="text-ink">Servis</span><span className="text-brand">Aku</span>
            </p>
            <p className="text-[6.5px] font-bold text-ink-secondary mt-1 tracking-wider uppercase">
              Community. Professional. Trusted.
            </p>
          </div>
        </Link>

        {/* Middle: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/explore" className="text-sm font-semibold text-ink flex items-center gap-1 hover:text-brand transition-colors">
            Service Categories <ChevronDown className="h-4 w-4" />
          </Link>
          <Link to="/how-it-works" className="text-sm font-semibold text-ink hover:text-brand transition-colors">
            How It Works
          </Link>
          <Link to="/business" className="text-sm font-semibold text-ink hover:text-brand transition-colors">
            For Businesses
          </Link>
          <Link to="/promos" className="text-sm font-semibold text-ink hover:text-brand transition-colors">
            Promotions
          </Link>
          <Link to="/help" className="text-sm font-semibold text-ink hover:text-brand transition-colors">
            Help
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-ink-secondary hover:text-ink cursor-pointer transition-colors">
            <MapPin className="h-4 w-4 text-brand" />
            <span className="text-sm font-semibold">Kuala Lumpur</span>
          </div>

          <Link to="/cart" className="relative text-ink-secondary hover:text-ink transition-colors">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 bg-brand text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-surface">
              2
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-brand transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-tint flex items-center justify-center text-brand font-bold">
                    {user.full_name?.charAt(0)}
                  </div>
                  {user.full_name?.split(' ')[0]}
                </Link>
                <button onClick={() => base44.auth.logout()} className="text-ink-secondary hover:text-danger transition-colors">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Button variant="outline" className="border-hairline/20 hover:bg-raised text-sm font-bold rounded-xl px-5 h-10" onClick={() => base44.auth.redirectToLogin()}>
                  Log In
                </Button>
                <Button className="bg-brand text-white hover:bg-brand/90 text-sm font-bold rounded-xl px-5 h-10 shadow-sm" onClick={() => base44.auth.redirectToLogin()}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
