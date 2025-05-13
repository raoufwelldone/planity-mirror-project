
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  salon: { name: string; address: string; city: string };
  stylist: { name: string };
  service: { name: string; price: number };
}

interface RecentSalon {
  id: string;
  name: string;
  city: string;
  image_url: string;
}

const ClientDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentSalons, setRecentSalons] = useState<RecentSalon[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch upcoming appointments
        const today = new Date().toISOString().split('T')[0];
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            start_time,
            salon:salon_id(name, address, city),
            stylist:stylist_id(name),
            service:service_id(name, price)
          `)
          .eq('user_id', user.id)
          .gte('appointment_date', today)
          .in('status', ['pending', 'confirmed'])
          .order('appointment_date', { ascending: true })
          .limit(3);

        if (appointmentsError) throw appointmentsError;
        
        // Fetch recent or popular salons
        const { data: salons, error: salonsError } = await supabase
          .from('salons')
          .select('id, name, city, image_url')
          .order('rating', { ascending: false })
          .limit(3);
          
        if (salonsError) throw salonsError;
          
        setUpcomingAppointments(appointments as Appointment[]);
        setRecentSalons(salons as RecentSalon[]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, toast]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name || 'Client'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  </div>
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{appointment.salon?.name || 'Salon'}</h3>
                      <span className="text-primary font-medium">${appointment.service?.price || 0}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{appointment.service?.name || 'Service'}</div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(appointment.appointment_date)} at {appointment.start_time}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Scissors className="h-4 w-4 mr-2" />
                      {appointment.stylist?.name || 'Any available stylist'}
                    </div>
                    <div className="flex items-start text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2 mt-1" />
                      <span>
                        {appointment.salon?.address && appointment.salon?.city 
                          ? `${appointment.salon.address}, ${appointment.salon.city}`
                          : 'Address not available'}
                      </span>
                    </div>
                  </div>
                ))}
                
                <Button asChild className="w-full mt-2">
                  <Link to="/client/appointments">View All Appointments</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">You have no upcoming appointments.</p>
                <Button asChild>
                  <Link to="/client/salons">Book an Appointment</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Popular Salons</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentSalons.length > 0 ? (
              <div className="space-y-4">
                {recentSalons.map((salon) => (
                  <Link to={`/client/salons/${salon.id}`} key={salon.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={salon.image_url || "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"} 
                        alt={salon.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{salon.name}</h3>
                      <p className="text-sm text-gray-500">{salon.city}</p>
                    </div>
                  </Link>
                ))}
                
                <Button asChild variant="outline" className="w-full">
                  <Link to="/client/salons">Explore More Salons</Link>
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">No salon data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
              <Link to="/client/salons">
                <MapPin className="h-8 w-8 mb-2" />
                <span>Find Salons</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
              <Link to="/client/appointments">
                <Calendar className="h-8 w-8 mb-2" />
                <span>View Appointments</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
              <Link to="/client/profile">
                <Clock className="h-8 w-8 mb-2" />
                <span>Update Profile</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;
