
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BookAppointment = () => {
  const { salonId } = useParams<{ salonId: string }>();
  const { user, login, register, isLoading: authLoading } = useAuth();
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
  
  // Auth dialog states
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

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
        toast({
          title: "Error",
          description: "Could not load available time slots. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchTimeSlots();
  }, [date, stylist, toast]);

  const handleBookAppointment = async () => {
    if (!date || !service || !timeSlot || !stylist || !salonId) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      // Open login dialog instead of redirecting
      setLoginDialogOpen(true);
      return;
    }

    await completeBooking();
  };

  const completeBooking = async () => {
    if (!user || !date || !service || !timeSlot || !stylist || !salonId) return;
    
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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    try {
      if (authMode === "login") {
        await login(email, password, "client");
      } else {
        if (password !== confirmPassword) {
          setAuthError("Passwords do not match");
          return;
        }
        await register(name, email, password, "client");
      }
      
      setLoginDialogOpen(false);
      
      // Complete the booking after successful authentication
      await completeBooking();
    } catch (error: any) {
      setAuthError(error.message || `Failed to ${authMode === 'login' ? 'log in' : 'register'}`);
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
              
              {!user && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  You'll be asked to log in or create an account to complete your booking.
                </p>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Authentication Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? 'Sign In' : 'Create Account'}</DialogTitle>
            <DialogDescription>
              {authMode === 'login' 
                ? 'Sign in to complete your booking' 
                : 'Create an account to complete your booking'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAuthSubmit} className="space-y-4 py-4">
            {authError && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {authError}
              </div>
            )}
            
            {authMode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            {authMode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}
            
            <DialogFooter className="flex-col gap-2 sm:flex-row pt-4">
              <div className="flex-1">
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                >
                  {authMode === 'login' ? "Need an account? Sign up" : "Already have an account? Sign in"}
                </Button>
              </div>
              <Button type="submit" disabled={isLoading || authLoading}>
                {isLoading || authLoading
                  ? "Loading..." 
                  : authMode === 'login' 
                    ? "Sign In to Book" 
                    : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookAppointment;
