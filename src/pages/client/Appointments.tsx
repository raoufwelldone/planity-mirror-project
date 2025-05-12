
import { useState } from "react";
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

const ClientAppointments = () => {
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  // Mock appointments data
  const upcomingAppointments = [
    {
      id: "apt-1",
      salonName: "Chic Hair Studio",
      service: "Women's Haircut",
      date: "May 15, 2025",
      time: "2:30 PM",
      stylist: "Jennifer Smith",
      location: "123 Fashion Ave, New York, NY"
    },
    {
      id: "apt-2",
      salonName: "Glamour Beauty Bar",
      service: "Manicure & Pedicure",
      date: "May 22, 2025",
      time: "11:00 AM",
      stylist: "Lisa Johnson",
      location: "456 Beauty Blvd, Brooklyn, NY"
    }
  ];

  const pastAppointments = [
    {
      id: "apt-3",
      salonName: "Elite Barber Shop",
      service: "Men's Haircut",
      date: "April 30, 2025",
      time: "3:00 PM",
      stylist: "Mark Thompson",
      location: "789 Style St, Queens, NY"
    }
  ];

  const handleCancelAppointment = () => {
    toast({
      title: "Appointment Cancelled",
      description: "Your appointment has been successfully cancelled."
    });
    setCancelDialogOpen(false);
  };

  const AppointmentCard = ({ appointment, showCancelButton = false }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold">{appointment.salonName}</h3>
            <p className="text-primary font-medium">{appointment.service}</p>
            
            <div className="flex items-center mt-2">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600 mr-4">{appointment.date}</span>
              <Clock className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">{appointment.time}</span>
            </div>
            
            <div className="flex items-center mt-1">
              <Scissors className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">{appointment.stylist}</span>
            </div>
            
            <div className="flex items-start mt-1">
              <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-1" />
              <span className="text-sm text-gray-600">{appointment.location}</span>
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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
      
      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appointment => (
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
            pastAppointments.map(appointment => (
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
