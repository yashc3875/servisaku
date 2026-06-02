import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from '@/components/ThemeProvider';

const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const BookingHistory = lazy(() => import('./pages/BookingHistory'));
const BookingDetail = lazy(() => import('./pages/BookingDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const PartnerDashboard = lazy(() => import('./pages/PartnerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Architecture = lazy(() => import('./pages/Architecture'));
const OTPLogin = lazy(() => import('./pages/OTPLogin'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));
const PartnerOnboarding = lazy(() => import('./pages/PartnerOnboarding'));
const ConsumerProfile = lazy(() => import('./pages/ConsumerProfile'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const BookingFlow = lazy(() => import('./pages/BookingFlow'));
const AdminBookings = lazy(() => import('./pages/AdminBookings'));
const PaymentCheckout = lazy(() => import('./pages/PaymentCheckout'));
const PartnerEarnings = lazy(() => import('./pages/PartnerEarnings'));
const AdminFinance = lazy(() => import('./pages/AdminFinance'));
const BookingInvoice = lazy(() => import('./pages/BookingInvoice'));
const LiveTracking = lazy(() => import('./pages/LiveTracking'));
const ChatScreen = lazy(() => import('./pages/ChatScreen'));
const PartnerJobScreen = lazy(() => import('./pages/PartnerJobScreen'));
const AdminOperations = lazy(() => import('./pages/AdminOperations'));
const ReviewFlow = lazy(() => import('./pages/ReviewFlow'));
const NotificationCenter = lazy(() => import('./pages/NotificationCenter'));
const PartnerCalendar = lazy(() => import('./pages/PartnerCalendar'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const ForBusiness = lazy(() => import('./pages/ForBusiness'));
const Promotions = lazy(() => import('./pages/Promotions'));
const Help = lazy(() => import('./pages/Help'));
const AdminCommunications = lazy(() => import('./pages/AdminCommunications'));
const AdminQualityCenter = lazy(() => import('./pages/AdminQualityCenter'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-brand rounded-full animate-spin"></div>
      </div>
    }>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/service/:serviceId" element={<ServiceDetail />} />
          <Route path="/book/:serviceId" element={<BookingFlow />} />
          <Route path="/bookings" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
          <Route path="/booking/:bookingId" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/partner" element={<ProtectedRoute><PartnerDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin','super_admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin','super_admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute roles={['admin','super_admin']}><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/finance" element={<ProtectedRoute roles={['admin','super_admin']}><AdminFinance /></ProtectedRoute>} />
          <Route path="/payment" element={<PaymentCheckout />} />
          <Route path="/booking/:bookingId/invoice" element={<BookingInvoice />} />
          <Route path="/partner/earnings" element={<ProtectedRoute><PartnerEarnings /></ProtectedRoute>} />
          <Route path="/partner/job/:bookingId" element={<ProtectedRoute><PartnerJobScreen /></ProtectedRoute>} />
          <Route path="/tracking/:bookingId" element={<ProtectedRoute><LiveTracking /></ProtectedRoute>} />
          <Route path="/chat/:bookingId" element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
          <Route path="/review/:bookingId" element={<ProtectedRoute><ReviewFlow /></ProtectedRoute>} />
          <Route path="/partner/calendar" element={<ProtectedRoute><PartnerCalendar /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
          <Route path="/admin/communications" element={<ProtectedRoute roles={['admin','super_admin']}><AdminCommunications /></ProtectedRoute>} />
          <Route path="/admin/quality" element={<ProtectedRoute roles={['admin','super_admin']}><AdminQualityCenter /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin','super_admin']}><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/operations" element={<ProtectedRoute roles={['admin','super_admin']}><AdminOperations /></ProtectedRoute>} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/business" element={<ForBusiness />} />
          <Route path="/promos" element={<Promotions />} />
          <Route path="/help" element={<Help />} />
          <Route path="/otp-login" element={<OTPLogin />} />
          <Route path="/profile/setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><ConsumerProfile /></ProtectedRoute>} />
          <Route path="/partner/onboarding" element={<ProtectedRoute><PartnerOnboarding /></ProtectedRoute>} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="servisaku-theme">
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App