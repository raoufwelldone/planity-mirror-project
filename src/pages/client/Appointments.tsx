
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Scissors, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  salon: {
    name: string;
    address: string;
    city: string;
  };
  stylist: {
    name: string;
  };
  service: {
    name: string;
  };
}

const ClientAppointments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setpastAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch upcoming appointments
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          start_time,
          end_time,
          status,
          salon:salon_id(name, address, city),
          stylist:stylist_id(name),
          service:service_id(name)
        `)
        .eq('user_id', user?.id)
        .gte('appointment_date', today)
        .in('status', ['pending', 'confirmed'])
        .order('appointment_date', { ascending: true });

      if (upcomingError) throw upcomingError;
      
      // Fetch past appointments
      const { data: pastData, error: pastError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          start_time,
          end_time,
          status,
          salon:salon_id(name, address, city),
          stylist:stylist_id(name),
          service:service_id(name)
        `)
        .eq('user_id', user?.id)
        .or(`appointment_date.lt.${today},status.eq.cancelled`)
        .order('appointment_date', { ascending: false });

      if (pastError) throw pastError;
      
      setUpcomingAppointments(upcomingData || []);
      setpastAppointments(pastData || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load your appointments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', selectedAppointment);
      
      if (error) throw error;
      
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled."
      });
      
      setCancelDialogOpen(false);
      
      // Refresh appointments
      fetchAppointments();
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const AppointmentCard = ({ appointment, showCancelButton = false }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold">{appointment.salon?.name || "Salon"}</h3>
            <p className="text-primary font-medium">{appointment.service?.name || "Service"}</p>
            
            <div className="flex items-center mt-2">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600 mr-4">{formatDate(appointment.appointment_date)}</span>
              <Clock className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">{appointment.start_time}</span>
            </div>
            
            <div className="flex items-center mt-1">
              <Scissors className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">{appointment.stylist?.name || "Any stylist"}</span>
            </div>
            
            <div className="flex items-start mt-1">
              <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-1" />
              <span className="text-sm text-gray-600">
                {appointment.salon?.address ? `${appointment.salon.address}, ${appointment.salon.city}` : "Address unavailable"}
              </span>
            </div>
          </div>
          
          {showCancelButton && (
            <Button 
              variant="outline" 
              className="shrink-0" 
              onClick={() => {
                setSelectedAppointment(appointment.id);
                setCancelDialogOpen(true);
              }}
            >
              Cancel Appointment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">Please sign in to view your appointments.</p>
            <Button asChild>
              <a href="/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment} 
                  showCancelButton={true}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">You have no upcoming appointments.</p>
                  <Button className="mt-4" asChild>
                    <a href="/client/salons">Book an Appointment</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {pastAppointments.length > 0 ? (
              pastAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment}
                  showCancelButton={false}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">You have no past appointments.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
      
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientAppointments;
