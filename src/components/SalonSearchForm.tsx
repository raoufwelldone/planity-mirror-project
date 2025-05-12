
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";

const SalonSearchForm = () => {
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/client/salons?location=${encodeURIComponent(location)}&service=${encodeURIComponent(service)}`);
  };

  return (
    <div className="max-w-3xl w-full mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Find Your Perfect Salon</h2>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Where? (City, neighborhood, etc.)"
            className="pl-10"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="What service? (Haircut, Color, etc.)"
            className="pl-10"
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
        </div>
        
        <Button type="submit" className="w-full">Search Salons</Button>
      </form>
    </div>
  );
};

export default SalonSearchForm;
