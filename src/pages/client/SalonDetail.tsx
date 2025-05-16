
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Globe, Clock, Calendar } from "lucide-react";
import { SalonReviews } from "@/components/reviews/SalonReviews";
import { SalonGallery } from "@/components/salon/SalonGallery";
import { ServiceList } from "@/components/services/ServiceList";
import { StaffList } from "@/components/staff/StaffList";

interface Salon {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  website: string | null;
  hours: string | null;
  image_url: string | null;
}

const SalonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("gallery");

  useEffect(() => {
    const fetchSalonDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('salons')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setSalon(data);
      } catch (error: any) {
        console.error("Error fetching salon details:", error);
        toast({
          title: "Error",
          description: "Failed to load salon details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSalonDetails();
  }, [id]);

  const handleBookAppointment = () => {
    if (salon) {
      window.location.href = `/client/book/${salon.id}`;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Salon Not Found</h1>
          <p className="mb-4">The salon you are looking for could not be found.</p>
          <Button onClick={() => (window.location.href = '/client/salons')}>
            Back to Salon List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{salon.name}</h1>
          <p className="text-gray-600 flex items-center mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            {salon.address}, {salon.city}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={handleBookAppointment} size="lg">
            <Calendar className="w-5 h-5 mr-2" />
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left side - Info */}
        <div className="md:col-span-2">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="gallery">
                <SalonGallery salonId={salon.id} />
              </TabsContent>
              <TabsContent value="services">
                <ServiceList salonId={salon.id} />
              </TabsContent>
              <TabsContent value="staff">
                <StaffList salonId={salon.id} />
              </TabsContent>
              <TabsContent value="reviews">
                <SalonReviews salonId={salon.id} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right side - Contact info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {salon.phone && (
                <div className="flex items-start">
                  <Phone className="w-5 h-5 mr-2 mt-0.5 text-primary" />
                  <div>
                    <div className="font-medium">Phone</div>
                    <div>{salon.phone}</div>
                  </div>
                </div>
              )}
              
              {salon.website && (
                <div className="flex items-start">
                  <Globe className="w-5 h-5 mr-2 mt-0.5 text-primary" />
                  <div>
                    <div className="font-medium">Website</div>
                    <div>
                      <a 
                        href={salon.website.startsWith('http') ? salon.website : `https://${salon.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {salon.website}
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              {salon.hours && (
                <div className="flex items-start">
                  <Clock className="w-5 h-5 mr-2 mt-0.5 text-primary" />
                  <div>
                    <div className="font-medium">Business Hours</div>
                    <div className="whitespace-pre-line">{salon.hours}</div>
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <Button onClick={handleBookAppointment} className="w-full">
                  Book Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {salon.description && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{salon.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalonDetail;
