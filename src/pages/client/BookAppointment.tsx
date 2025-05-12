
import { useState } from "react";
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
  
  // Mock data - in a real app this would come from an API
  const salon = {
    id: salonId,
    name: "Chic Hair Studio",
  };

  const services = [
    { id: "1", name: "Women's Haircut", price: "$50" },
    { id: "2", name: "Men's Haircut", price: "$35" },
    { id: "3", name: "Hair Coloring", price: "$80" },
    { id: "4", name: "Highlights", price: "$120" },
    { id: "5", name: "Blowout", price: "$45" },
  ];

  const stylists = [
    { id: "1", name: "Jennifer Smith" },
    { id: "2", name: "Michael Johnson" },
    { id: "3", name: "Emily Davis" },
  ];

  const timeSlots = [
    "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", 
    "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  const handleBookAppointment = () => {
    if (!date || !service || !timeSlot || !stylist) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been successfully scheduled.",
      });
      navigate("/client/appointments");
    }, 1500);
  };

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
                className="rounded-md border"
              />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Available Time Slots</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={timeSlot === slot ? "default" : "outline"}
                      onClick={() => setTimeSlot(slot)}
                      className="w-full"
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
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
                        {svc.name} ({svc.price})
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
                        {s.name}
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
