
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface AccessLevel {
  id: string;
  name: string;
  manage_own_schedule: boolean;
  manage_all_schedules: boolean;
  access_client_files: boolean;
  access_finances: boolean;
}

interface Service {
  id: string;
  name: string;
}

interface StaffFormProps {
  salonId: string;
  onSuccess: () => void;
  initialData?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    description: string;
    employment_type: "employee" | "independent";
    access_level_id: string;
    services: string[];
  };
}

export const StaffForm = ({ salonId, onSuccess, initialData }: StaffFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    position: initialData?.position || "",
    description: initialData?.description || "",
    employment_type: initialData?.employment_type || "employee",
    access_level_id: initialData?.access_level_id || "",
    services: initialData?.services || [],
  });

  useEffect(() => {
    const fetchAccessLevels = async () => {
      try {
        const { data, error } = await supabase
          .from("user_access_levels")
          .select("*")
          .order("name");

        if (error) throw error;
        setAccessLevels(data || []);
        
        // Set default access level to Manager if none is selected
        if (!formData.access_level_id && data && data.length > 0) {
          const managerAccessLevel = data.find(level => level.name === "Manager Access");
          if (managerAccessLevel) {
            setFormData(prev => ({ ...prev, access_level_id: managerAccessLevel.id }));
          } else {
            setFormData(prev => ({ ...prev, access_level_id: data[0].id }));
          }
        }
      } catch (error) {
        console.error("Error fetching access levels:", error);
      }
    };

    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("id, name")
          .eq("salon_id", salonId)
          .order("name");

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchAccessLevels();
    fetchServices();
  }, [salonId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.name.trim()) {
        throw new Error("Staff member name is required");
      }

      if (!formData.email.trim()) {
        throw new Error("Email is required");
      }

      if (!formData.access_level_id) {
        throw new Error("Access level is required");
      }

      // First, create or update the staff record
      const staffData = {
        salon_id: salonId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        position: formData.position.trim(),
        description: formData.description.trim(),
        employment_type: formData.employment_type,
        access_level_id: formData.access_level_id,
        // Generate a random token if this is a new staff member
        invite_token: !initialData ? Math.random().toString(36).substring(2, 15) : undefined,
        // Set expiration date to 7 days from now if this is a new staff member
        invite_expires_at: !initialData ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      };

      let staffId: string;
      if (initialData) {
        // Update existing staff member
        const { error } = await supabase
          .from("staff")
          .update(staffData)
          .eq("id", initialData.id);

        if (error) throw error;
        staffId = initialData.id;
      } else {
        // Create new staff member
        const { data, error } = await supabase
          .from("staff")
          .insert(staffData)
          .select();

        if (error) throw error;
        staffId = data[0].id;
      }

      // Now handle the staff services
      if (initialData) {
        // Delete existing staff services before inserting new ones
        await supabase
          .from("staff_services")
          .delete()
          .eq("staff_id", staffId);
      }

      // Insert new staff services
      if (formData.services.length > 0) {
        const staffServicesData = formData.services.map(serviceId => ({
          staff_id: staffId,
          service_id: serviceId,
        }));

        const { error } = await supabase
          .from("staff_services")
          .insert(staffServicesData);

        if (error) throw error;
      }

      toast({
        title: initialData ? "Staff member updated" : "Staff member created",
        description: initialData
          ? "The staff member has been updated successfully"
          : "The staff member has been created successfully",
      });

      // TODO: Send invitation email to new staff members

      onSuccess();
    } catch (error: any) {
      console.error("Error saving staff member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save staff member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="john@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (optional)</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+33 1 23 45 67 89"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          required
          placeholder="Hair Stylist, Receptionist, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="A brief description of the staff member's expertise and experience."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Employee Type</Label>
        <RadioGroup
          value={formData.employment_type}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, employment_type: value as "employee" | "independent" }))
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="employee" id="employee" />
            <Label htmlFor="employee">Employee</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="independent" id="independent" />
            <Label htmlFor="independent">Independent</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Access Level</Label>
        {accessLevels.map((level) => (
          <div key={level.id} className="border rounded-md p-4 space-y-2 mb-2">
            <div className="flex items-start">
              <RadioGroupItem
                value={level.id}
                id={level.id}
                className="mt-1 mr-2"
                checked={formData.access_level_id === level.id}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, access_level_id: level.id }))
                }
              />
              <div>
                <Label htmlFor={level.id} className="text-base font-medium mb-2 block">
                  {level.name}
                </Label>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className={level.manage_own_schedule ? "text-green-600" : "text-red-600"}>
                      {level.manage_own_schedule ? "✓" : "✗"}
                    </div>
                    <span className="ml-2 text-sm">Manage own schedule</span>
                  </div>
                  <div className="flex items-center">
                    <div className={level.manage_all_schedules ? "text-green-600" : "text-red-600"}>
                      {level.manage_all_schedules ? "✓" : "✗"}
                    </div>
                    <span className="ml-2 text-sm">Manage all schedules</span>
                  </div>
                  <div className="flex items-center">
                    <div className={level.access_client_files ? "text-green-600" : "text-red-600"}>
                      {level.access_client_files ? "✓" : "✗"}
                    </div>
                    <span className="ml-2 text-sm">Access client files</span>
                  </div>
                  <div className="flex items-center">
                    <div className={level.access_finances ? "text-green-600" : "text-red-600"}>
                      {level.access_finances ? "✓" : "✗"}
                    </div>
                    <span className="ml-2 text-sm">Access finances</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Services</Label>
        <p className="text-sm text-gray-500 mb-2">
          Select the services this staff member can provide:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {services.map((service) => (
            <div key={service.id} className="flex items-center space-x-2">
              <Checkbox
                id={`service-${service.id}`}
                checked={formData.services.includes(service.id)}
                onCheckedChange={() => handleServiceToggle(service.id)}
              />
              <Label htmlFor={`service-${service.id}`} className="text-sm">
                {service.name}
              </Label>
            </div>
          ))}
        </div>
        {services.length === 0 && (
          <p className="text-sm text-amber-600">
            No services found. Please add services to your salon first.
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading
          ? "Saving..."
          : initialData
          ? "Update Staff Member"
          : "Create Staff Member"}
      </Button>
    </form>
  );
};
