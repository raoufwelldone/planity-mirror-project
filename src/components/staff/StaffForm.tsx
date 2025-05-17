
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface AccessLevel {
  id: string;
  name: string;
}

interface StaffFormProps {
  salonId: string;
  onSuccess: () => void;
  initialData?: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    position: string;
    description?: string;
    employment_type: "employee" | "independent";
    access_level_id?: string;
    active?: boolean;
  };
}

export const StaffForm = ({ salonId, onSuccess, initialData }: StaffFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    position: initialData?.position || "",
    description: initialData?.description || "",
    employment_type: initialData?.employment_type || "employee" as "employee" | "independent",
    access_level_id: initialData?.access_level_id || "",
    active: initialData?.active !== undefined ? initialData.active : true,
  });

  // Fetch access levels when component mounts
  useEffect(() => {
    const fetchAccessLevels = async () => {
      try {
        const { data, error } = await supabase
          .from("user_access_levels")
          .select("id, name")
          .order("name");

        if (error) throw error;
        setAccessLevels(data || []);
        
        // If no access levels exist, create default ones
        if (!data || data.length === 0) {
          await createDefaultAccessLevels();
        }
      } catch (error) {
        console.error("Error fetching access levels:", error);
      }
    };
    
    fetchAccessLevels();
  }, []);
  
  // Create default access levels if none exist
  const createDefaultAccessLevels = async () => {
    try {
      const defaultLevels = [
        { name: "Admin", manage_own_schedule: true, manage_all_schedules: true, access_client_files: true, access_finances: true },
        { name: "Manager", manage_own_schedule: true, manage_all_schedules: true, access_client_files: true, access_finances: false },
        { name: "Staff", manage_own_schedule: true, manage_all_schedules: false, access_client_files: false, access_finances: false },
      ];
      
      const { data, error } = await supabase
        .from("user_access_levels")
        .insert(defaultLevels)
        .select();
      
      if (error) throw error;
      setAccessLevels(data || []);
      
    } catch (error) {
      console.error("Error creating default access levels:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.name.trim()) {
        throw new Error("Staff name is required");
      }

      if (!formData.email.trim()) {
        throw new Error("Email is required");
      }

      if (!formData.position.trim()) {
        throw new Error("Position is required");
      }

      const staffData = {
        salon_id: salonId,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        position: formData.position.trim(),
        description: formData.description.trim() || null,
        employment_type: formData.employment_type,
        access_level_id: formData.access_level_id || null,
        active: formData.active,
      };

      let result;
      if (initialData?.id) {
        // Update existing staff member
        result = await supabase
          .from("staff")
          .update(staffData)
          .eq("id", initialData.id);
      } else {
        // Insert new staff member
        const inviteToken = Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Token expires in 7 days
        
        result = await supabase
          .from("staff")
          .insert({
            ...staffData,
            invite_token: inviteToken,
            invite_expires_at: expiresAt.toISOString(),
          });
      }

      if (result.error) throw result.error;

      toast({
        title: initialData?.id ? "Staff updated" : "Staff created",
        description: initialData?.id
          ? "The staff member has been updated successfully"
          : "The staff member has been created successfully. An invitation will be sent to their email.",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error saving staff:", error);
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
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 234 567 8900"
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
          placeholder="Hair Stylist, Manicurist, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description/Bio (optional)</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Staff bio or additional information"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="employment_type">Employment Type</Label>
        <Select 
          value={formData.employment_type} 
          onValueChange={(value) => handleSelectChange("employment_type", value as "employee" | "independent")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select employment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="independent">Independent Contractor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="access_level_id">Access Level</Label>
        <Select 
          value={formData.access_level_id} 
          onValueChange={(value) => handleSelectChange("access_level_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select access level" />
          </SelectTrigger>
          <SelectContent>
            {accessLevels.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => handleSwitchChange("active", checked)}
        />
        <Label htmlFor="active">Active</Label>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : initialData?.id ? "Update Staff" : "Create Staff"}
      </Button>
    </form>
  );
};
