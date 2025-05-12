
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getSalonById, getSalonServices, getSalonStylists, getAvailableTimeSlots, Salon, Service, Stylist } from "@/services/salonService";
import { supabase } from "@/integrations/supabase/client";

const BookAppointment = () => {
  const { salonId } = useParams<{ salonId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [service, setService] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [stylist, setStylist] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ time: string; available: boolean }[]>([]);

  useEffect(() => {
    const fetchSalonData = async () => {
      if (!salonId) return;
      
      setLoadingData(true);
      try {
        // Fetch salon details
        const salonData = await getSalonById(salonId);
        setSalon(salonData);
        
        // Fetch services
        const servicesData = await getSalonServices(salonId);
        setServices(servicesData);
        
        // Fetch stylists
        const stylistsData = await getSalonStylists(salonId);
        setStylists(stylistsData);
      } catch (error) {
        console.error("Error fetching salon data:", error);
        toast({
          title: "Error",
          description: "Could not load salon data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchSalonData();
  }, [salonId, toast]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!date || !stylist) return;
      
      try {
        const slots = await getAvailableTimeSlots(stylist, date);
        setTimeSlots(slots);
        setTimeSlot(""); // Reset selected time slot when date or stylist changes
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
    };

    fetchTimeSlots();
  }, [date, stylist]);

  const handleBookAppointment = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to book an appointment",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!date || !service || !timeSlot || !stylist || !salonId) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Calculate end time based on service duration
      const selectedService = services.find(s => s.id === service);
      if (!selectedService) throw new Error("Service not found");
      
      const startTime = timeSlot;
      
      // Calculate end time by adding the service duration to the start time
      const [startHours, startMinutes] = timeSlot.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(startHours, startMinutes, 0);
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + selectedService.duration);
      
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      
      // Format appointment date
      const appointmentDate = date.toISOString().split('T')[0];
      
      // Insert appointment into database
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          salon_id: salonId,
          stylist_id: stylist,
          service_id: service,
          appointment_date: appointmentDate,
          start_time: startTime,
          end_time: endTime,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been successfully scheduled.",
      });
      
      navigate("/client/appointments");
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Could not book your appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Book Appointment</h1>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Book Appointment</h1>
        <p className="text-gray-600 mb-8">Salon not found</p>
        <Button onClick={() => navigate("/client/salons")}>Back to Salons</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Book Appointment</h1>
      <p className="text-gray-600 mb-8">Schedule an appointment at {salon.name}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Date & Time</CardTitle>
            <CardDescription>Choose your preferred date and time slot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border pointer-events-auto"
                disabled={(date) => {
                  // Disable dates in the past and more than 30 days in the future
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const thirtyDaysLater = new Date(today);
                  thirtyDaysLater.setDate(today.getDate() + 30);
                  return date < today || date > thirtyDaysLater;
                }}
              />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Available Time Slots</h3>
                {timeSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={timeSlot === slot.time ? "default" : "outline"}
                        onClick={() => setTimeSlot(slot.time)}
                        className="w-full"
                        disabled={!slot.available}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                ) : date && stylist ? (
                  <p className="text-sm text-gray-500">No available time slots for this day</p>
                ) : (
                  <p className="text-sm text-gray-500">Please select a date and stylist to see available time slots</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>Select your preferred service and stylist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Service</label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((svc) => (
                      <SelectItem key={svc.id} value={svc.id}>
                        {svc.name} (${svc.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Stylist</label>
                <Select value={stylist} onValueChange={setStylist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a stylist" />
                  </SelectTrigger>
                  <SelectContent>
                    {stylists.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.specialty})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Separator />
            <div className="w-full">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Selected Service:</span>
                <span>{service ? services.find(s => s.id === service)?.name : "None"}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Selected Date:</span>
                <span>{date ? date.toLocaleDateString() : "None"}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Selected Time:</span>
                <span>{timeSlot || "None"}</span>
              </div>
              <div className="flex justify-between mb-6">
                <span className="font-medium">Selected Stylist:</span>
                <span>{stylist ? stylists.find(s => s.id === stylist)?.name : "None"}</span>
              </div>
              
              <Button 
                onClick={handleBookAppointment} 
                className="w-full" 
                disabled={isLoading || !date || !service || !timeSlot || !stylist}
              >
                {isLoading ? "Booking..." : "Book Appointment"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default BookAppointment;
