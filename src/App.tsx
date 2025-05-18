
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth, AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ClientLayout from "./layouts/ClientLayout";
import PartnerLayout from "./layouts/PartnerLayout";
import ClientDashboard from "./pages/client/Dashboard";
import SalonList from "./pages/client/SalonList";
import SalonDetail from "./pages/client/SalonDetail";
import BookAppointment from "./pages/client/BookAppointment";
import ClientProfile from "./pages/client/Profile";
import ClientAppointments from "./pages/client/Appointments";
import PartnerDashboard from "./pages/partner/Dashboard";
import PartnerServices from "./pages/partner/Services";
import PartnerSchedule from "./pages/partner/Schedule";
import PartnerAppointments from "./pages/partner/Appointments";
import PartnerProfile from "./pages/partner/Profile";

const queryClient = new QueryClient();

// Protected route component with improved authentication handling
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: "client" | "partner" }) => {
  const { user, isLoading, session } = useAuth();
  const location = useLocation();
  
  // Show loading indicator while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect if not authenticated or wrong role
  if (!user || !session) {
    console.log("Access denied: Not authenticated", {
      path: location.pathname
    });
    
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    console.log("Access denied: Wrong role", {
      userRole: user.role,
      requiredRole,
      path: location.pathname
    });
    
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user.role === "client" ? "/client" : "/partner";
    return <Navigate to={redirectPath} replace />;
  }
  
  console.log("Access granted:", {
    user: user.id,
    role: user.role,
    path: location.pathname
  });
  
  return <>{children}</>;
};

// Public route component that redirects authenticated users to their dashboard
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, session } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If user is authenticated, redirect to their dashboard
  if (user && session) {
    const redirectPath = user.role === "client" ? "/client" : "/partner";
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Client Routes */}
            <Route path="/client" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout />
              </ProtectedRoute>
            }>
              <Route path="" element={<ClientDashboard />} />
              <Route path="salons" element={<SalonList />} />
              <Route path="salons/:id" element={<SalonDetail />} />
              <Route path="book/:salonId" element={<BookAppointment />} />
              <Route path="appointments" element={<ClientAppointments />} />
              <Route path="profile" element={<ClientProfile />} />
            </Route>
            
            {/* Partner Routes */}
            <Route path="/partner" element={
              <ProtectedRoute requiredRole="partner">
                <PartnerLayout />
              </ProtectedRoute>
            }>
              <Route path="" element={<PartnerDashboard />} />
              <Route path="services" element={<PartnerServices />} />
              <Route path="schedule" element={<PartnerSchedule />} />
              <Route path="appointments" element={<PartnerAppointments />} />
              <Route path="profile" element={<PartnerProfile />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
