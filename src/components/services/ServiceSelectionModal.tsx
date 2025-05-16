
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Tag, ChevronDown, ChevronUp, Check } from "lucide-react";
import { formatServiceCategories, searchServices } from "@/utils/serviceCategories";
import { Checkbox } from "@/components/ui/checkbox";

// Simplified version of the JSON structure
const serviceCategories: Record<string, string[]> = {
  "Femme_Coupe_de_cheveux_et_coiffure": [
    "Brushing",
    "Coupe",
    "Frange",
    "Chignon",
    "Extensions de cheveux"
  ],
  "Homme_Coupe_de_cheveux_et_barbier": [
    "Homme - Coupe",
    "Homme - Taille de la barbe",
    "Homme - Rasage à l'ancienne"
  ],
  "Manucure": [
    "Pose de vernis",
    "Manucure express",
    "Manucure Spa"
  ],
  "Massage_classique": [
    "Massage du corps relaxant",
    "Massage du corps californien",
    "Massage du dos"
  ]
};

interface Service {
  name: string;
  category: string;
  variants?: string[];
  duration: number;
  price: number;
}

interface ServiceSelectionModalProps {
  salonId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ServiceSelectionModal = ({ salonId, onSuccess, onCancel }: ServiceSelectionModalProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState(formatServiceCategories(serviceCategories));
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const handleServiceSelect = (serviceName: string, categoryName: string) => {
    // Check if the service is already selected
    const existingIndex = selectedServices.findIndex(s => s.name === serviceName);
    
    if (existingIndex >= 0) {
      // Remove if already selected
      setSelectedServices(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      // Add new service
      setSelectedServices(prev => [
        ...prev,
        {
          name: serviceName,
          category: categoryName,
          duration: 30, // Default duration
          price: 0, // Default price
        }
      ]);
    }
  };

  const handlePriceChange = (index: number, price: number) => {
    setSelectedServices(prev => 
      prev.map((service, i) => 
        i === index ? { ...service, price } : service
      )
    );
  };

  const handleDurationChange = (index: number, duration: number) => {
    setSelectedServices(prev => 
      prev.map((service, i) => 
        i === index ? { ...service, duration } : service
      )
    );
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      toast({
        title: "No services selected",
        description: "Please select at least one service to add",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare service data for insertion
      const servicesToInsert = selectedServices.map(service => ({
        salon_id: salonId,
        name: service.name,
        price: service.price,
        duration: service.duration,
        description: service.category,
      }));

      // Insert all selected services
      const { error } = await supabase
        .from("services")
        .insert(servicesToInsert);

      if (error) throw error;

      toast({
        title: "Services added",
        description: `Successfully added ${servicesToInsert.length} services`,
      });
      onSuccess();
    } catch (error: any) {
      console.error("Error adding services:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add services",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSearchResults = () => {
    if (!searchQuery.trim()) return null;

    const results = searchServices(searchQuery, categories);
    
    if (results.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No services found matching "{searchQuery}"
        </div>
      );
    }

    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-500">Search Results:</p>
        {results.map((result) => (
          <div
            key={result.value}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer"
            onClick={() => handleServiceSelect(result.label, result.category)}
          >
            <div>
              <p>{result.label}</p>
              <p className="text-xs text-gray-500">{result.category}</p>
            </div>
            <Checkbox
              checked={selectedServices.some(s => s.name === result.label)}
              onCheckedChange={() => handleServiceSelect(result.label, result.category)}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {renderSearchResults()}
      </div>

      {/* Browse Categories */}
      {searchQuery.trim() === "" && (
        <div>
          <h3 className="mb-2 font-medium">Browse by Category</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-md overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                  onClick={() => toggleCategoryExpansion(category.id)}
                >
                  <span className="font-medium">{category.name}</span>
                  {expandedCategories.includes(category.id) ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
                {expandedCategories.includes(category.id) && (
                  <div className="p-3 divide-y">
                    {category.services.map((service) => (
                      <div
                        key={service}
                        className="flex items-center justify-between py-2"
                      >
                        <span>{service}</span>
                        <Checkbox
                          checked={selectedServices.some(s => s.name === service)}
                          onCheckedChange={() => handleServiceSelect(service, category.name)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Services */}
      {selectedServices.length > 0 && (
        <div>
          <h3 className="mb-2 font-medium">Selected Services ({selectedServices.length})</h3>
          <Card>
            <CardContent className="p-4 space-y-4">
              {selectedServices.map((service, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-gray-500">{service.category}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleServiceSelect(service.name, service.category)}
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1">
                      <Label htmlFor={`price-${index}`}>Price (€)</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={service.price}
                        onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`duration-${index}`}>Duration (min)</Label>
                      <Input
                        id={`duration-${index}`}
                        type="number"
                        min="5"
                        step="5"
                        value={service.duration}
                        onChange={(e) => handleDurationChange(index, parseInt(e.target.value) || 30)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          disabled={selectedServices.length === 0 || isSubmitting}
        >
          {isSubmitting ? "Adding Services..." : "Add Selected Services"}
        </Button>
      </div>
    </div>
  );
};
