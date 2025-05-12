
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star, Scissors, List, Map as MapIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Map from "@/components/Map";
import { getSalons, Salon } from "@/services/salonService";

const SalonList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const locationParam = queryParams.get('location') || "";
  const serviceParam = queryParams.get('service') || "";

  useEffect(() => {
    const fetchSalons = async () => {
      setLoading(true);
      try {
        const filters = {
          location: locationParam,
          service: serviceParam
        };
        const salonsData = await getSalons(filters);
        setSalons(salonsData);
      } catch (error) {
        console.error("Error fetching salons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalons();
  }, [locationParam, serviceParam]);

  // Filter salons based on search query
  const filteredSalons = salons.filter(salon => 
    salon.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    salon.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    salon.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSalonSelect = (salonId: string) => {
    navigate(`/client/salons/${salonId}`);
  };

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

      {locationParam || serviceParam ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {locationParam && (
            <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{locationParam}</span>
            </div>
          )}
          {serviceParam && (
            <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full">
              <Scissors className="w-4 h-4 mr-1" />
              <span className="text-sm">{serviceParam}</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-sm"
            onClick={() => navigate("/client/salons")}
          >
            Clear filters
          </Button>
        </div>
      ) : null}
      
      <Tabs defaultValue="list" value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "map")}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <List className="w-4 h-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-1">
              <MapIcon className="w-4 h-4" />
              Map View
            </TabsTrigger>
          </TabsList>
          
          <span className="text-sm text-gray-500">
            {filteredSalons.length} {filteredSalons.length === 1 ? 'salon' : 'salons'} found
          </span>
        </div>

        <TabsContent value="list" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 animate-pulse mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 animate-pulse mb-4 w-1/2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse mb-4 w-full"></div>
                    <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSalons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSalons.map((salon) => (
                <Link to={`/client/salons/${salon.id}`} key={salon.id}>
                  <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={salon.image_url || "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"} 
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
                          <span className="text-gray-500 text-xs ml-1">({salon.reviews_count} reviews)</span>
                        </div>
                      </div>
                      <div className="flex items-start mb-3">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1 mt-0.5" />
                        <span className="text-gray-500 text-sm">{salon.address}, {salon.city}</span>
                      </div>
                      <Button 
                        className="w-full mt-2"
                        asChild
                      >
                        <Link to={`/client/book/${salon.id}`}>Book Now</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No salons found matching your search criteria.</p>
              <Button onClick={() => navigate("/client/salons")}>Clear Search</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="map" className="mt-0">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Map 
              salons={filteredSalons.map(salon => ({
                id: salon.id,
                name: salon.name,
                latitude: salon.latitude,
                longitude: salon.longitude
              }))} 
              onSalonSelect={handleSalonSelect}
            />
            <div className="p-4 border-t">
              <h3 className="font-medium mb-2">Quick Actions:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredSalons.slice(0, 4).map((salon) => (
                  <Button 
                    key={salon.id} 
                    variant="outline" 
                    size="sm"
                    className="justify-start overflow-hidden"
                    onClick={() => handleSalonSelect(salon.id)}
                  >
                    <span className="truncate">{salon.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalonList;
