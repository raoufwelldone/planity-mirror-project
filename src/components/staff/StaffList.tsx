
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StaffForm } from "./StaffForm";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  description: string;
  employment_type: "employee" | "independent";
  access_level_id: string;
  active: boolean;
  invite_token: string | null;
  invite_expires_at: string | null;
  access_level: {
    name: string;
  };
  services: string[];
}

interface StaffListProps {
  salonId: string;
  editable?: boolean;
}

export const StaffList = ({ salonId, editable = false }: StaffListProps) => {
  const { toast } = useToast();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffFormOpen, setStaffFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchStaffMembers = async () => {
    setIsLoading(true);
    try {
      // Fetch staff members with their access levels
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select(`
          *,
          access_level:access_level_id(name)
        `)
        .eq("salon_id", salonId)
        .order("name");

      if (staffError) throw staffError;

      // Fetch staff services
      const staffMembers = staffData || [];
      const staffServicesPromises = staffMembers.map(async (staff) => {
        const { data: servicesData, error: servicesError } = await supabase
          .from("staff_services")
          .select("service_id")
          .eq("staff_id", staff.id);

        if (servicesError) throw servicesError;

        return {
          ...staff,
          services: (servicesData || []).map((item) => item.service_id),
        };
      });

      const staffWithServices = await Promise.all(staffServicesPromises);
      setStaffMembers(staffWithServices);
    } catch (error: any) {
      console.error("Error fetching staff:", error);
      toast({
        title: "Error",
        description: "Failed to load staff members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (salonId) {
      fetchStaffMembers();
    }
  }, [salonId]);

  const handleDeleteStaff = async (id: string) => {
    try {
      setDeletingId(id);
      
      // First delete the staff services
      const { error: staffServicesError } = await supabase
        .from("staff_services")
        .delete()
        .eq("staff_id", id);
        
      if (staffServicesError) throw staffServicesError;
      
      // Then delete the staff member
      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Staff member deleted",
        description: "The staff member has been removed",
      });

      // Update local state
      setStaffMembers(staffMembers.filter((staff) => staff.id !== id));
    } catch (error: any) {
      console.error("Error deleting staff member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete staff member",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setStaffFormOpen(true);
  };

  const handleFormSuccess = () => {
    setStaffFormOpen(false);
    setEditingStaff(null);
    fetchStaffMembers();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (staffMembers.length === 0 && !editable) {
    return <p className="text-gray-500 text-center py-8">No staff members available</p>;
  }

  return (
    <div className="space-y-6">
      {editable && (
        <div>
          <Dialog open={staffFormOpen} onOpenChange={setStaffFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
                </DialogTitle>
              </DialogHeader>
              <StaffForm
                salonId={salonId}
                onSuccess={handleFormSuccess}
                initialData={editingStaff || undefined}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staffMembers.map((staff) => (
          <Card key={staff.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{staff.name}</CardTitle>
                    <p className="text-sm text-gray-500">{staff.position}</p>
                  </div>
                </div>
                {editable && (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditStaff(staff)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteStaff(staff.id)}
                      disabled={deletingId === staff.id}
                    >
                      {deletingId === staff.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 text-sm">
                  <div className="text-gray-500">Email:</div>
                  <div>{staff.email}</div>
                  
                  {staff.phone && (
                    <>
                      <div className="text-gray-500">Phone:</div>
                      <div>{staff.phone}</div>
                    </>
                  )}
                  
                  <div className="text-gray-500">Type:</div>
                  <div className="capitalize">{staff.employment_type}</div>
                  
                  <div className="text-gray-500">Access Level:</div>
                  <div>{staff.access_level?.name || "Unknown"}</div>
                  
                  <div className="text-gray-500">Account Status:</div>
                  <div className="flex items-center">
                    {staff.invite_token ? (
                      <Badge variant="outline" className="text-amber-600 border-amber-600 flex items-center">
                        <XCircle className="h-3 w-3 mr-1" /> Invitation Pending
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-600 flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                      </Badge>
                    )}
                  </div>
                </div>
                
                {staff.description && (
                  <div className="text-sm">
                    <div className="text-gray-500 mb-1">Description:</div>
                    <p>{staff.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
