
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Phone, Clock, Globe, Scissors } from "lucide-react";

const SalonDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock salon data - in a real app this would come from an API
  const salon = {
    id: id || "salon-1",
    name: "Chic Hair Studio",
    image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80",
    description: "At Chic Hair Studio, we believe that beauty begins with great hair. Our team of highly skilled stylists are passionate about creating looks that not only enhance your natural beauty but also reflect your personal style. From classic cuts to the latest trends, we offer a wide range of services tailored to your specific needs.",
    location: "123 Fashion Ave, New York, NY 10001",
    phone: "(212) 555-1234",
    website: "www.chichairsstudio.com",
    hours: "Mon-Sat: 9am - 7pm, Sun: 10am - 5pm",
    rating: 4.8,
    reviews: 124,
    services: [
      { name: "Women's Haircut", price: "$50+" },
      { name: "Men's Haircut", price: "$35+" },
      { name: "Hair Coloring", price: "$80+" },
      { name: "Highlights", price: "$120+" },
      { name: "Blowout", price: "$45+" },
      { name: "Hair Treatment", price: "$75+" },
    ],
    stylists: [
      { name: "Jennifer Smith", specialty: "Color Specialist", experience: "10 years" },
      { name: "Michael Johnson", specialty: "Precision Cuts", experience: "8 years" },
      { name: "Emily Davis", specialty: "Styling", experience: "5 years" },
    ]
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link to="/client/salons" className="text-primary hover:underline mb-4 inline-block">
          &larr; Back to Salons
        </Link>
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
          <img 
            src={salon.image} 
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
              <span className="text-gray-600">{salon.reviews} reviews</span>
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
            <span>{salon.location}</span>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardContent className="flex items-center p-4">
            <Phone className="h-5 w-5 text-gray-500 mr-3" />
            <span>{salon.phone}</span>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardContent className="flex items-center p-4">
            <Clock className="h-5 w-5 text-gray-500 mr-3" />
            <span>{salon.hours}</span>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">About</h2>
        <p className="text-gray-700">{salon.description}</p>
      </div>
      
      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="stylists">Stylists</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {salon.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <Scissors className="h-5 w-5 text-gray-500 mr-3" />
                  <span>{service.name}</span>
                </div>
                <span className="font-medium">{service.price}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="stylists" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {salon.stylists.map((stylist, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg">{stylist.name}</h3>
                  <p className="text-sm text-gray-600">{stylist.specialty}</p>
                  <p className="text-sm text-gray-500">{stylist.experience} experience</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalonDetail;
