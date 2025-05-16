
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceGroupForm } from "./ServiceGroupForm";

interface ServiceGroup {
  id: string;
  name: string;
}

interface ServiceFormProps {
  salonId: string;
  onSuccess: () => void;
  initialData?: {
    id?: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    group_id?: string | null;
  };
}

export const ServiceForm = ({ salonId, onSuccess, initialData }: ServiceFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [activeTab, setActiveTab] = useState<string>("service");
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    duration: initialData?.duration || 30,
    group_id: initialData?.group_id || "",
  });

  // Fetch service groups when component mounts or when a new group is added
  const fetchServiceGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("service_groups")
        .select("id, name")
        .eq("salon_id", salonId)
        .order("name");

      if (error) throw error;
      setServiceGroups(data || []);
    } catch (error) {
      console.error("Error fetching service groups:", error);
    }
  };

  useEffect(() => {
    fetchServiceGroups();
  }, [salonId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "duration" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.name.trim()) {
        throw new Error("Service name is required");
      }

      if (formData.price <= 0) {
        throw new Error("Price must be greater than zero");
      }

      if (formData.duration <= 0) {
        throw new Error("Duration must be greater than zero");
      }

      const serviceData = {
        salon_id: salonId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        duration: formData.duration,
        group_id: formData.group_id || null,
      };

      let result;
      if (initialData?.id) {
        // Update existing service
        result = await supabase
          .from("services")
          .update(serviceData)
          .eq("id", initialData.id);
      } else {
        // Insert new service
        result = await supabase
          .from("services")
          .insert(serviceData);
      }

      if (result.error) throw result.error;

      toast({
        title: initialData?.id ? "Service updated" : "Service created",
        description: initialData?.id
          ? "The service has been updated successfully"
          : "The service has been created successfully",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error saving service:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupSuccess = () => {
    fetchServiceGroups();
    setActiveTab("service");
    toast({
      title: "Group created",
      description: "The service group has been created successfully",
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="service">Service Details</TabsTrigger>
        <TabsTrigger value="group">Create Group</TabsTrigger>
      </TabsList>
      
      <TabsContent value="service">
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Haircut, Manicure"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the service..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (€)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="5"
                step="5"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="group_id">Service Group</Label>
            <div className="flex space-x-2 items-end">
              <div className="flex-1">
                <Select 
                  value={formData.group_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, group_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {serviceGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setActiveTab("group")}
                className="whitespace-nowrap"
              >
                New Group
              </Button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : initialData?.id ? "Update Service" : "Create Service"}
          </Button>
        </form>
      </TabsContent>
      
      <TabsContent value="group">
        <div className="py-4">
          <ServiceGroupForm 
            salonId={salonId} 
            onSuccess={handleGroupSuccess} 
          />
          
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab("service")}
              className="text-sm"
            >
              Back to service
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
