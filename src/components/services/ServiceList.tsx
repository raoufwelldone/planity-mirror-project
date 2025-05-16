
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ServiceForm } from "./ServiceForm";
import { ServiceGroupForm } from "./ServiceGroupForm";
import { ServiceSelectionModal } from "./ServiceSelectionModal";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  group_id: string | null;
}

interface ServiceGroup {
  id: string;
  name: string;
  description: string;
}

interface ServiceListProps {
  salonId: string;
  editable?: boolean;
}

export const ServiceList = ({ salonId, editable = false }: ServiceListProps) => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingGroup, setEditingGroup] = useState<ServiceGroup | null>(null);
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch service groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("service_groups")
        .select("*")
        .eq("salon_id", salonId)
        .order("name");

      if (groupsError) throw groupsError;

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("salon_id", salonId)
        .order("name");

      if (servicesError) throw servicesError;

      setGroups(groupsData || []);
      setServices(servicesData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load services and groups",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (salonId) {
      fetchData();
    }
  }, [salonId]);

  const handleDeleteService = async (id: string) => {
    try {
      setDeletingId(id);
      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Service deleted",
        description: "The service has been removed",
      });

      // Update local state
      setServices(services.filter((service) => service.id !== id));
    } catch (error: any) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      setDeletingId(id);
      
      // Check if there are services using this group
      const servicesInGroup = services.filter(service => service.group_id === id);
      
      if (servicesInGroup.length > 0) {
        toast({
          title: "Cannot delete group",
          description: "Remove all services from this group first",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase.from("service_groups").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Group deleted",
        description: "The service group has been removed",
      });

      // Update local state
      setGroups(groups.filter((group) => group.id !== id));
    } catch (error: any) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete group",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceFormOpen(true);
  };

  const handleEditGroup = (group: ServiceGroup) => {
    setEditingGroup(group);
    setGroupFormOpen(true);
  };

  const handleFormSuccess = () => {
    setServiceFormOpen(false);
    setGroupFormOpen(false);
    setCatalogOpen(false);
    setEditingService(null);
    setEditingGroup(null);
    fetchData();
  };

  const getGroupName = (groupId: string | null) => {
    if (!groupId) return null;
    const group = groups.find((g) => g.id === groupId);
    return group ? group.name : null;
  };

  // Group services by their group_id
  const groupedServices = () => {
    const ungrouped = services.filter((service) => !service.group_id);
    const grouped: Record<string, Service[]> = {};

    services
      .filter((service) => service.group_id)
      .forEach((service) => {
        if (!grouped[service.group_id as string]) {
          grouped[service.group_id as string] = [];
        }
        grouped[service.group_id as string].push(service);
      });

    return { ungrouped, grouped };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (services.length === 0 && !editable) {
    return <p className="text-gray-500 text-center py-8">No services available</p>;
  }

  const { ungrouped, grouped } = groupedServices();

  return (
    <div className="space-y-6">
      {editable && (
        <div className="flex flex-wrap gap-2">
          <Dialog open={serviceFormOpen} onOpenChange={setServiceFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Edit Service" : "Add New Service"}
                </DialogTitle>
              </DialogHeader>
              <ServiceForm
                salonId={salonId}
                onSuccess={handleFormSuccess}
                initialData={editingService || undefined}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Check className="h-4 w-4 mr-2" />
                Add from Catalog
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add Services from Catalog</DialogTitle>
              </DialogHeader>
              <ServiceSelectionModal
                salonId={salonId}
                onSuccess={handleFormSuccess}
                onCancel={() => setCatalogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={groupFormOpen} onOpenChange={setGroupFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Service Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingGroup ? "Edit Service Group" : "Add New Service Group"}
                </DialogTitle>
              </DialogHeader>
              <ServiceGroupForm
                salonId={salonId}
                onSuccess={handleFormSuccess}
                initialData={editingGroup || undefined}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Display groups and their services */}
      {groups.map((group) => (
        <Card key={group.id} className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">{group.name}</CardTitle>
            {editable && (
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditGroup(group)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteGroup(group.id)}
                  disabled={deletingId === group.id || Boolean(grouped[group.id]?.length)}
                >
                  {deletingId === group.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </CardHeader>
          {group.description && (
            <div className="px-6 pb-2 text-sm text-gray-500">
              {group.description}
            </div>
          )}
          <CardContent>
            <div className="divide-y">
              {grouped[group.id]?.map((service) => (
                <div
                  key={service.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-gray-500">{service.description}</p>
                    )}
                    <div className="text-sm mt-1">
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">€{service.price}</span>
                    {editable && (
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteService(service.id)}
                          disabled={deletingId === service.id}
                        >
                          {deletingId === service.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )) || <p className="text-gray-500 py-2">No services in this group</p>}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Display ungrouped services */}
      {ungrouped.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Other Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {ungrouped.map((service) => (
                <div
                  key={service.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-gray-500">{service.description}</p>
                    )}
                    <div className="text-sm mt-1">
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">€{service.price}</span>
                    {editable && (
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteService(service.id)}
                          disabled={deletingId === service.id}
                        >
                          {deletingId === service.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
