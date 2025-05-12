
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Scissors } from "lucide-react";

const SalonList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock salon data
  const salons = [
    {
      id: "salon-1",
      name: "Chic Hair Studio",
      image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      location: "New York, NY",
      rating: 4.8,
      services: ["Haircuts", "Coloring", "Styling"]
    },
    {
      id: "salon-2",
      name: "Glamour Beauty Bar",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      location: "Brooklyn, NY",
      rating: 4.6,
      services: ["Makeup", "Nails", "Hair Treatments"]
    },
    {
      id: "salon-3",
      name: "Elite Barber Shop",
      image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      location: "Queens, NY",
      rating: 4.9,
      services: ["Men's Cuts", "Beard Trim", "Hot Towel Shave"]
    },
  ];

  // Filter salons based on search query
  const filteredSalons = salons.filter(salon => 
    salon.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    salon.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Find Salons</h1>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input 
          placeholder="Search by salon name or location" 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSalons.map((salon) => (
          <Link to={`/client/salons/${salon.id}`} key={salon.id}>
            <Card className="overflow-hidden transition-shadow hover:shadow-lg">
              <div className="h-48 overflow-hidden">
                <img 
                  src={salon.image} 
                  alt={salon.name} 
                  className="w-full h-full object-cover transition-transform hover:scale-105" 
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-1">{salon.name}</h3>
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-medium text-sm">{salon.rating}</span>
                  </div>
                </div>
                <div className="flex items-start mb-3">
                  <MapPin className="w-4 h-4 text-gray-400 mr-1 mt-0.5" />
                  <span className="text-gray-500 text-sm">{salon.location}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {salon.services.map((service, idx) => (
                    <span key={idx} className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                      {service}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SalonList;
