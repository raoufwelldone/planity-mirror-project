
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ClientDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">You have no upcoming appointments.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No recent activity to display.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
