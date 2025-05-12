
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
import PartnerStaff from "./pages/partner/Staff";
import PartnerSchedule from "./pages/partner/Schedule";
import PartnerAppointments from "./pages/partner/Appointments";
import PartnerProfile from "./pages/partner/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Client Routes */}
            <Route path="/client" element={<ClientLayout />}>
              <Route path="" element={<ClientDashboard />} />
              <Route path="salons" element={<SalonList />} />
              <Route path="salons/:id" element={<SalonDetail />} />
              <Route path="book/:salonId" element={<BookAppointment />} />
              <Route path="appointments" element={<ClientAppointments />} />
              <Route path="profile" element={<ClientProfile />} />
            </Route>
            
            {/* Partner Routes */}
            <Route path="/partner" element={<PartnerLayout />}>
              <Route path="" element={<PartnerDashboard />} />
              <Route path="services" element={<PartnerServices />} />
              <Route path="staff" element={<PartnerStaff />} />
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
