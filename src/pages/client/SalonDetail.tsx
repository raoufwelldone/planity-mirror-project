
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Phone, Clock, Globe, Scissors } from "lucide-react";
import Map from "@/components/Map";
import { getSalonById, getSalonServices, getSalonStylists, Salon, Service, Stylist } from "@/services/salonService";
import { useToast } from "@/hooks/use-toast";

const SalonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalonData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch salon details
        const salonData = await getSalonById(id);
        setSalon(salonData);
        
        if (salonData) {
          // Fetch services
          const servicesData = await getSalonServices(salonData.id);
          setServices(servicesData);
          
          // Fetch stylists
          const stylistsData = await getSalonStylists(salonData.id);
          setStylists(stylistsData);
        }
      } catch (error) {
        console.error("Error fetching salon data:", error);
        toast({
          title: "Error",
          description: "Could not load salon data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSalonData();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Salon not found</h1>
        <Link to="/client/salons" className="text-primary hover:underline">
          &larr; Back to Salons
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link to="/client/salons" className="text-primary hover:underline mb-4 inline-block">
          &larr; Back to Salons
        </Link>
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
          <img 
            src={salon.image_url || "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80"} 
            alt={salon.name} 
            className="w-full h-full object-cover" 
          />
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{salon.name}</h1>
            <div className="flex items-center mt-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 font-medium">{salon.rating}</span>
              <span className="mx-1 text-gray-400">•</span>
              <span className="text-gray-600">{salon.reviews_count} reviews</span>
            </div>
          </div>
          <Button size="lg" asChild>
            <Link to={`/client/book/${salon.id}`}>Book Appointment</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-muted">
          <CardContent className="flex items-center p-4">
            <MapPin className="h-5 w-5 text-gray-500 mr-3" />
            <span>{salon.address}, {salon.city}</span>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardContent className="flex items-center p-4">
            <Phone className="h-5 w-5 text-gray-500 mr-3" />
            <span>{salon.phone || 'No phone number available'}</span>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardContent className="flex items-center p-4">
            <Clock className="h-5 w-5 text-gray-500 mr-3" />
            <span>{salon.hours || 'Hours not available'}</span>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">About</h2>
        <p className="text-gray-700">{salon.description || 'No description available.'}</p>
      </div>

      {/* Map Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Location</h2>
        <Map 
          salons={[{
            id: salon.id,
            name: salon.name,
            latitude: salon.latitude,
            longitude: salon.longitude
          }]} 
          onSalonSelect={() => {}}
        />
      </div>
      
      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="stylists">Stylists</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="pt-4">
          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <Scissors className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <span className="font-medium">{service.name}</span>
                      <p className="text-xs text-gray-500">{service.description}</p>
                      <p className="text-xs text-gray-500">{service.duration} min</p>
                    </div>
                  </div>
                  <span className="font-medium">${service.price}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No services listed for this salon.</p>
          )}
        </TabsContent>
        <TabsContent value="stylists" className="pt-4">
          {stylists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stylists.map((stylist) => (
                <Card key={stylist.id}>
                  <CardContent className="p-4">
                    {stylist.image_url && (
                      <div className="mb-4 h-40 overflow-hidden rounded-lg">
                        <img 
                          src={stylist.image_url} 
                          alt={stylist.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-lg">{stylist.name}</h3>
                    <p className="text-sm text-gray-600">{stylist.specialty}</p>
                    <p className="text-sm text-gray-500">{stylist.experience} experience</p>
                    {stylist.bio && (
                      <p className="text-sm mt-2">{stylist.bio}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No stylists listed for this salon.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalonDetail;
