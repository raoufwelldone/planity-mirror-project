
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, TrendingUp, DollarSign } from "lucide-react";

const PartnerDashboard = () => {
  const { user } = useAuth();

  const metrics = [
    {
      title: "Total Appointments",
      value: "24",
      icon: <CalendarDays className="h-8 w-8 text-primary" />,
      change: "+12%"
    },
    {
      title: "Total Clients",
      value: "42",
      icon: <Users className="h-8 w-8 text-primary" />,
      change: "+8%"
    },
    {
      title: "Revenue",
      value: "$1,842",
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      change: "+5%"
    },
    {
      title: "Engagement",
      value: "87%",
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      change: "+2%"
    }
  ];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                {metric.icon}
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {metric.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold mt-4">{metric.value}</h3>
              <p className="text-gray-600">{metric.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="font-medium">Women's Haircut</p>
                <p className="text-sm text-gray-500">Emma Watson · 2:30 PM</p>
              </div>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Today
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="font-medium">Hair Coloring</p>
                <p className="text-sm text-gray-500">Sarah Johnson · 10:00 AM</p>
              </div>
              <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                Tomorrow
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Men's Haircut</p>
                <p className="text-sm text-gray-500">John Smith · 4:00 PM</p>
              </div>
              <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                May 16
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="font-medium">New Appointment Booked</p>
                <p className="text-sm text-gray-500">Hair Coloring with Sarah Johnson</p>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="font-medium">Appointment Completed</p>
                <p className="text-sm text-gray-500">Men's Haircut with Michael Brown</p>
              </div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">New Service Added</p>
                <p className="text-sm text-gray-500">Hair Treatment - $75</p>
              </div>
              <span className="text-xs text-gray-500">Yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerDashboard;
