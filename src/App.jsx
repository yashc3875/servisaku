import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ServiceDetail from './pages/ServiceDetail';
import BookingPage from './pages/BookingPage';
import BookingHistory from './pages/BookingHistory';
import BookingDetail from './pages/BookingDetail';
import Profile from './pages/Profile';
import PartnerDashboard from './pages/PartnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Architecture from './pages/Architecture';
import OTPLogin from './pages/OTPLogin';
import ProfileSetup from './pages/ProfileSetup';
import PartnerOnboarding from './pages/PartnerOnboarding';
import ConsumerProfile from './pages/ConsumerProfile';
import AdminUsers from './pages/AdminUsers';
import BookingFlow from './pages/BookingFlow';
import AdminBookings from './pages/AdminBookings';
import PaymentCheckout from './pages/PaymentCheckout';
import PartnerEarnings from './pages/PartnerEarnings';
import AdminFinance from './pages/AdminFinance';
import BookingInvoice from './pages/BookingInvoice';
import LiveTracking from './pages/LiveTracking';
import ChatScreen from './pages/ChatScreen';
import PartnerJobScreen from './pages/PartnerJobScreen';
import AdminOperations from './pages/AdminOperations';
import ReviewFlow from './pages/ReviewFlow';
import NotificationCenter from './pages/NotificationCenter';
import AdminCommunications from './pages/AdminCommunications';
import AdminQualityCenter from './pages/AdminQualityCenter';
import AdminAnalytics from './pages/AdminAnalytics';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

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
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/service/:serviceId" element={<ServiceDetail />} />
        <Route path="/book/:serviceId" element={<BookingFlow />} />
        <Route path="/bookings" element={<BookingHistory />} />
        <Route path="/booking/:bookingId" element={<BookingDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/partner" element={<PartnerDashboard />} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin','super_admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin','super_admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute roles={['admin','super_admin']}><AdminBookings /></ProtectedRoute>} />
        <Route path="/admin/finance" element={<ProtectedRoute roles={['admin','super_admin']}><AdminFinance /></ProtectedRoute>} />
        <Route path="/payment" element={<PaymentCheckout />} />
        <Route path="/booking/:bookingId/invoice" element={<BookingInvoice />} />
        <Route path="/partner/earnings" element={<PartnerEarnings />} />
        <Route path="/partner/job/:bookingId" element={<PartnerJobScreen />} />
        <Route path="/tracking/:bookingId" element={<LiveTracking />} />
        <Route path="/chat/:bookingId" element={<ChatScreen />} />
        <Route path="/review/:bookingId" element={<ReviewFlow />} />
        <Route path="/notifications" element={<NotificationCenter />} />
        <Route path="/admin/communications" element={<ProtectedRoute roles={['admin','super_admin']}><AdminCommunications /></ProtectedRoute>} />
        <Route path="/admin/quality" element={<ProtectedRoute roles={['admin','super_admin']}><AdminQualityCenter /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin','super_admin']}><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/operations" element={<ProtectedRoute roles={['admin','super_admin']}><AdminOperations /></ProtectedRoute>} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/otp-login" element={<OTPLogin />} />
        <Route path="/profile/setup" element={<ProfileSetup />} />
        <Route path="/profile/edit" element={<ConsumerProfile />} />
        <Route path="/partner/onboarding" element={<PartnerOnboarding />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App