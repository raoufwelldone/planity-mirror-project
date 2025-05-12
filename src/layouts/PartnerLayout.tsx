
import { useEffect } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  CalendarDays, 
  ClipboardList, 
  Home, 
  LogOut, 
  Menu, 
  Users, 
  User, 
  X,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const PartnerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    // Redirect if not logged in or not a partner
    if (!user) {
      navigate("/login");
    } else if (user.role !== "partner") {
      navigate("/client");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", path: "/partner", icon: <Home className="w-5 h-5 mr-2" /> },
    { name: "Services", path: "/partner/services", icon: <ClipboardList className="w-5 h-5 mr-2" /> },
    { name: "Staff", path: "/partner/staff", icon: <Users className="w-5 h-5 mr-2" /> },
    { name: "Schedule", path: "/partner/schedule", icon: <Calendar className="w-5 h-5 mr-2" /> },
    { name: "Appointments", path: "/partner/appointments", icon: <CalendarDays className="w-5 h-5 mr-2" /> },
    { name: "Profile", path: "/partner/profile", icon: <User className="w-5 h-5 mr-2" /> },
  ];

  if (!user || user.role !== "partner") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/partner" className="text-xl font-bold text-primary">
              BeautyCraft Partner
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-primary transition-colors"
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              <Button variant="ghost" onClick={handleLogout} className="flex items-center">
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </nav>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Mobile Nav */}
      {mobileNavOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <span className="text-xl font-bold text-primary">BeautyCraft Partner</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileNavOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="p-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center px-3 py-4 text-gray-600 hover:text-primary transition-colors border-b"
                onClick={() => setMobileNavOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            <Button
              variant="ghost"
              onClick={() => {
                handleLogout();
                setMobileNavOpen(false);
              }}
              className="flex items-center px-3 py-4 text-gray-600 hover:text-primary transition-colors w-full justify-start"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PartnerLayout;
