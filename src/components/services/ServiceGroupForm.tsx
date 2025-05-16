
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ServiceGroupFormProps {
  salonId: string;
  onSuccess: () => void;
  initialData?: {
    id?: string;
    name: string;
    description: string;
  };
}

export const ServiceGroupForm = ({ salonId, onSuccess, initialData }: ServiceGroupFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.name.trim()) {
        throw new Error("Group name is required");
      }

      const groupData = {
        salon_id: salonId,
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      let result;
      if (initialData?.id) {
        // Update existing group
        result = await supabase
          .from("service_groups")
          .update(groupData)
          .eq("id", initialData.id);
      } else {
        // Insert new group
        result = await supabase
          .from("service_groups")
          .insert(groupData);
      }

      if (result.error) throw result.error;

      toast({
        title: initialData?.id ? "Group updated" : "Group created",
        description: initialData?.id
          ? "The service group has been updated successfully"
          : "The service group has been created successfully",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error saving service group:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save service group",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Group Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., Haircuts, Nail Care"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the service group..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : initialData?.id ? "Update Group" : "Create Group"}
      </Button>
    </form>
  );
};
