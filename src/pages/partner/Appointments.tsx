
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, Phone, Scissors, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const PartnerAppointments = () => {
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Mock time slots
  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
  ];
  
  // Mock appointments data
  const appointments = [
    {
      id: "apt-1",
      clientName: "Emma Watson",
      service: "Women's Haircut",
      date: new Date(),
      time: "10:30 AM",
      duration: 60,
      phone: "(212) 555-1234",
      stylist: "Jennifer Smith",
      status: "confirmed"
    },
    {
      id: "apt-2",
      clientName: "John Smith",
      service: "Men's Haircut",
      date: new Date(),
      time: "1:00 PM",
      duration: 30,
      phone: "(212) 555-5678",
      stylist: "Michael Johnson",
      status: "confirmed"
    },
    {
      id: "apt-3",
      clientName: "Sarah Johnson",
      service: "Hair Coloring",
      date: new Date(Date.now() + 86400000),
      time: "11:00 AM",
      duration: 120,
      phone: "(212) 555-9012",
      stylist: "Jennifer Smith",
      status: "pending"
    },
    {
      id: "apt-4",
      clientName: "Mike Brown",
      service: "Beard Trim",
      date: new Date(Date.now() - 86400000),
      time: "3:30 PM",
      duration: 30,
      phone: "(212) 555-3456",
      stylist: "Michael Johnson",
      status: "completed"
    },
    {
      id: "apt-5",
      clientName: "Lisa Davis",
      service: "Blowout",
      date: new Date(Date.now() - 172800000),
      time: "2:00 PM",
      duration: 45,
      phone: "(212) 555-7890",
      stylist: "Emily Davis",
      status: "completed"
    },
    {
      id: "apt-6",
      clientName: "David Wilson",
      service: "Hair Treatment",
      date: new Date(Date.now() - 86400000),
      time: "10:00 AM",
      duration: 90,
      phone: "(212) 555-2468",
      stylist: "Emily Davis",
      status: "cancelled"
    }
  ];
  
  // Filter appointments by today, upcoming, or past
  const todayAppointments = appointments.filter(apt => {
    const today = new Date();
    return apt.date.getDate() === today.getDate() && 
           apt.date.getMonth() === today.getMonth() && 
           apt.date.getFullYear() === today.getFullYear() &&
           (filterStatus === "all" || apt.status === filterStatus);
  });
  
  const upcomingAppointments = appointments.filter(apt => {
    const today = new Date();
    return apt.date > today && 
           !(apt.date.getDate() === today.getDate() && 
             apt.date.getMonth() === today.getMonth() && 
             apt.date.getFullYear() === today.getFullYear()) &&
           (filterStatus === "all" || apt.status === filterStatus);
  });
  
  const pastAppointments = appointments.filter(apt => {
    const today = new Date();
    return apt.date < today && 
           !(apt.date.getDate() === today.getDate() && 
             apt.date.getMonth() === today.getMonth() && 
             apt.date.getFullYear() === today.getFullYear()) &&
           (filterStatus === "all" || apt.status === filterStatus);
  });
  
  const handleCancelAppointment = () => {
    // In a real app, this would update the database
    toast({
      title: "Appointment Cancelled",
      description: "The appointment has been cancelled."
    });
    setCancelDialogOpen(false);
  };
  
  const handleRescheduleAppointment = () => {
    if (!newTimeSlot) {
      toast({
        variant: "destructive",
        title: "Please select a new time slot",
      });
      return;
    }
    
    // In a real app, this would update the database
    toast({
      title: "Appointment Rescheduled",
      description: `The appointment has been rescheduled to ${newTimeSlot}.`
    });
    setRescheduleDialogOpen(false);
    setNewTimeSlot("");
  };
  
  const handleStatusChange = (id: string, status: string) => {
    // In a real app, this would update the database
    toast({
      title: "Status Updated",
      description: `Appointment status has been updated to ${status}.`
    });
  };
  
  const AppointmentCard = ({ appointment }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "confirmed": return "bg-green-100 text-green-800";
        case "pending": return "bg-yellow-100 text-yellow-800";
        case "completed": return "bg-blue-100 text-blue-800";
        case "cancelled": return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
      }
    };
    
    const isPast = new Date(appointment.date) < new Date();
    
    return (
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{appointment.clientName}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
              <p className="text-primary font-medium">{appointment.service}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 mt-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {format(appointment.date, "MMM d, yyyy")}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {appointment.time} ({appointment.duration} min)
                  </span>
                </div>
                
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">{appointment.stylist}</span>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">{appointment.phone}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-row md:flex-col gap-2 justify-end">
              {appointment.status !== "cancelled" && appointment.status !== "completed" && !isPast && (
                <>
                  <Button 
                    variant="outline"
                    className="shrink-0"
                    onClick={() => {
                      setSelectedAppointment(appointment.id);
                      setRescheduleDialogOpen(true);
                    }}
                  >
                    Reschedule
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="shrink-0 text-destructive border-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setSelectedAppointment(appointment.id);
                      setCancelDialogOpen(true);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
              
              {appointment.status === "confirmed" && !isPast && (
                <Button 
                  variant="outline"
                  className="shrink-0"
                  onClick={() => handleStatusChange(appointment.id, "completed")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-500">Filter by status:</span>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="today">
        <TabsList className="mb-6">
          <TabsTrigger value="today">Today ({todayAppointments.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today">
          {todayAppointments.length > 0 ? (
            todayAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No appointments for today.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No upcoming appointments.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastAppointments.length > 0 ? (
            pastAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No past appointments.</p>
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
              No, Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Yes, Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new time slot for this appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Available Time Slots</label>
              <Select value={newTimeSlot} onValueChange={setNewTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(slot => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRescheduleAppointment}>
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerAppointments;
