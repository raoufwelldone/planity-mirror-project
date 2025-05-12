
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash } from "lucide-react";

const PartnerServices = () => {
  const { toast } = useToast();
  const [services, setServices] = useState([
    { id: 1, name: "Women's Haircut", description: "Precision cut tailored to your style", duration: 60, price: 50 },
    { id: 2, name: "Men's Haircut", description: "Classic or modern style with attention to detail", duration: 30, price: 35 },
    { id: 3, name: "Hair Coloring", description: "Full color, highlights, or balayage", duration: 120, price: 80 },
    { id: 4, name: "Blowout", description: "Professional styling after wash", duration: 45, price: 45 },
  ]);
  
  const [newService, setNewService] = useState({ name: "", description: "", duration: "", price: "" });
  const [editingService, setEditingService] = useState<null | { id: number, name: string, description: string, duration: string, price: string }>(null);
  
  const handleAddService = () => {
    if (!newService.name || !newService.duration || !newService.price) {
      toast({
        variant: "destructive",
        title: "Please fill in all required fields",
      });
      return;
    }
    
    const serviceToAdd = {
      id: services.length ? Math.max(...services.map(s => s.id)) + 1 : 1,
      name: newService.name,
      description: newService.description,
      duration: parseInt(newService.duration),
      price: parseInt(newService.price)
    };
    
    setServices([...services, serviceToAdd]);
    setNewService({ name: "", description: "", duration: "", price: "" });
    
    toast({
      title: "Service added successfully",
    });
  };
  
  const handleUpdateService = () => {
    if (!editingService || !editingService.name || !editingService.duration || !editingService.price) {
      toast({
        variant: "destructive",
        title: "Please fill in all required fields",
      });
      return;
    }
    
    setServices(services.map(service => 
      service.id === editingService.id 
        ? {
            ...service,
            name: editingService.name,
            description: editingService.description,
            duration: parseInt(editingService.duration),
            price: parseInt(editingService.price)
          }
        : service
    ));
    
    setEditingService(null);
    
    toast({
      title: "Service updated successfully",
    });
  };
  
  const handleDeleteService = (id: number) => {
    setServices(services.filter(service => service.id !== id));
    toast({
      title: "Service deleted successfully",
    });
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Services</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Service</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Add details about the service you offer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddService}>Add Service</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{service.name}</CardTitle>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingService({
                          id: service.id,
                          name: service.name,
                          description: service.description,
                          duration: service.duration.toString(),
                          price: service.price.toString()
                        })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Service</DialogTitle>
                        <DialogDescription>
                          Update the details of this service.
                        </DialogDescription>
                      </DialogHeader>
                      {editingService && (
                        <div className="grid gap-4 py-4">
                          <div>
                            <Label htmlFor="edit-name">Service Name</Label>
                            <Input
                              id="edit-name"
                              value={editingService.name}
                              onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                              id="edit-description"
                              value={editingService.description}
                              onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-duration">Duration (minutes)</Label>
                              <Input
                                id="edit-duration"
                                type="number"
                                value={editingService.duration}
                                onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-price">Price ($)</Label>
                              <Input
                                id="edit-price"
                                type="number"
                                value={editingService.price}
                                onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button onClick={handleUpdateService}>Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{service.duration} minutes</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium text-primary">${service.price}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PartnerServices;
