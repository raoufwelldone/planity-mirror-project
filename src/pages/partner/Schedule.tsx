
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay } from "date-fns";
import { Clock } from "lucide-react";

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 17; hour++) {
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour >= 12 ? "PM" : "AM";
    slots.push(`${formattedHour}:00 ${period}`);
    if (hour !== 17) { // No 5:30 slot
      slots.push(`${formattedHour}:30 ${period}`);
    }
  }
  return slots;
};

const PartnerSchedule = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [blockDate, setBlockDate] = useState<Date | undefined>(new Date());
  const [blockReason, setBlockReason] = useState("");
  const [blockedDates, setBlockedDates] = useState<{date: Date, reason: string}[]>([]);
  
  const timeSlots = generateTimeSlots();
  
  // Mock staff data
  const staffMembers = [
    { id: "1", name: "Jennifer Smith" },
    { id: "2", name: "Michael Johnson" },
    { id: "3", name: "Emily Davis" },
  ];
  
  // Mock appointments
  const appointments = [
    { id: 1, date: new Date(), time: "10:00 AM", client: "Emma Watson", service: "Women's Haircut", staffId: "1" },
    { id: 2, date: new Date(), time: "2:30 PM", client: "John Smith", service: "Men's Haircut", staffId: "2" },
    { id: 3, date: new Date(Date.now() + 86400000), time: "11:00 AM", client: "Sarah Johnson", service: "Hair Coloring", staffId: "1" },
  ];
  
  const filteredAppointments = appointments.filter(appointment => 
    date && isSameDay(appointment.date, date) && 
    (selectedStaff === "all" || appointment.staffId === selectedStaff)
  );
  
  const handleBlockDate = () => {
    if (!blockDate) {
      toast({
        variant: "destructive",
        title: "Please select a date",
      });
      return;
    }
    
    setBlockedDates([...blockedDates, { date: blockDate, reason: blockReason || "Unavailable" }]);
    setBlockReason("");
    
    toast({
      title: "Date blocked successfully",
      description: `${format(blockDate, "MMMM d, yyyy")} has been blocked.`,
    });
  };
  
  const isDateBlocked = (date: Date) => {
    return blockedDates.some(blockedDate => isSameDay(blockedDate.date, date));
  };
  
  const getBlockReason = (date: Date) => {
    const blockedDate = blockedDates.find(bd => isSameDay(bd.date, date));
    return blockedDate ? blockedDate.reason : "";
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Schedule Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                blocked: blockedDates.map(bd => bd.date),
              }}
              modifiersStyles={{
                blocked: { 
                  backgroundColor: "#FECACA", 
                  color: "#B91C1C",
                  textDecoration: "line-through" 
                },
              }}
            />
            <div className="mt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">Block Date</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Block Date</DialogTitle>
                    <DialogDescription>
                      Block a date when you or your staff are not available.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label>Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={blockDate}
                        onSelect={setBlockDate}
                        className="rounded-md border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reason">Reason (Optional)</Label>
                      <Input
                        id="reason"
                        value={blockReason}
                        onChange={(e) => setBlockReason(e.target.value)}
                        placeholder="E.g., Holiday, Staff Training"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleBlockDate}>Block Date</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {date && isDateBlocked(date) && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
                <p className="font-medium">This date is blocked</p>
                <p>{getBlockReason(date)}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {date ? format(date, "MMMM d, yyyy") : "Select a date"}
              </CardTitle>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {staffMembers.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {date && !isDateBlocked(date) ? (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map(appointment => (
                      <div 
                        key={appointment.id}
                        className="p-4 border rounded-lg flex items-center space-x-4"
                      >
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{appointment.time}</p>
                          <p className="text-sm">{appointment.client}</p>
                          <p className="text-sm text-gray-500">{appointment.service}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {staffMembers.find(s => s.id === appointment.staffId)?.name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-10">No appointments scheduled.</p>
                  )}
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Available Time Slots</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {timeSlots.map(slot => {
                      const isBooked = filteredAppointments.some(apt => apt.time === slot);
                      return (
                        <Button
                          key={slot}
                          variant={isBooked ? "secondary" : "outline"}
                          disabled={isBooked}
                          className="w-full"
                        >
                          {slot}
                          {isBooked && <span className="ml-2 text-xs">(Booked)</span>}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                {date ? "This date is blocked for appointments." : "Please select a date to view schedule."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerSchedule;
