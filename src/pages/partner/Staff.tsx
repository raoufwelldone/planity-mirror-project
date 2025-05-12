
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash } from "lucide-react";

const PartnerStaff = () => {
  const { toast } = useToast();
  const [staff, setStaff] = useState([
    { 
      id: 1, 
      name: "Jennifer Smith", 
      position: "Hair Stylist",
      email: "jennifer@example.com",
      phone: "212-555-1234", 
      skills: ["Haircuts", "Coloring"],
      bio: "Jennifer has over 10 years of experience specializing in color treatments and precision cuts."
    },
    { 
      id: 2, 
      name: "Michael Johnson", 
      position: "Barber",
      email: "michael@example.com",
      phone: "212-555-5678", 
      skills: ["Men's Cuts", "Beard Trim"],
      bio: "Michael is our senior barber with expertise in classic and modern men's styling."
    },
    { 
      id: 3, 
      name: "Emily Davis", 
      position: "Stylist",
      email: "emily@example.com",
      phone: "212-555-9012", 
      skills: ["Blowouts", "Styling", "Extensions"],
      bio: "Emily is passionate about creating stunning updos and special occasion styles."
    },
  ]);
  
  const [newStaff, setNewStaff] = useState({ 
    name: "", 
    position: "", 
    email: "", 
    phone: "", 
    skills: "", 
    bio: "" 
  });
  const [editingStaff, setEditingStaff] = useState<null | { 
    id: number, 
    name: string, 
    position: string, 
    email: string, 
    phone: string, 
    skills: string, 
    bio: string 
  }>(null);
  
  const positionOptions = ["Hair Stylist", "Barber", "Colorist", "Stylist", "Nail Technician", "Esthetician", "Manager"];
  
  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.position || !newStaff.email) {
      toast({
        variant: "destructive",
        title: "Please fill in all required fields",
      });
      return;
    }
    
    const staffToAdd = {
      id: staff.length ? Math.max(...staff.map(s => s.id)) + 1 : 1,
      name: newStaff.name,
      position: newStaff.position,
      email: newStaff.email,
      phone: newStaff.phone,
      skills: newStaff.skills.split(',').map(skill => skill.trim()),
      bio: newStaff.bio
    };
    
    setStaff([...staff, staffToAdd]);
    setNewStaff({ name: "", position: "", email: "", phone: "", skills: "", bio: "" });
    
    toast({
      title: "Staff member added successfully",
    });
  };
  
  const handleUpdateStaff = () => {
    if (!editingStaff || !editingStaff.name || !editingStaff.position || !editingStaff.email) {
      toast({
        variant: "destructive",
        title: "Please fill in all required fields",
      });
      return;
    }
    
    setStaff(staff.map(member => 
      member.id === editingStaff.id 
        ? {
            ...member,
            name: editingStaff.name,
            position: editingStaff.position,
            email: editingStaff.email,
            phone: editingStaff.phone,
            skills: editingStaff.skills.split(',').map(skill => skill.trim()),
            bio: editingStaff.bio
          }
        : member
    ));
    
    setEditingStaff(null);
    
    toast({
      title: "Staff member updated successfully",
    });
  };
  
  const handleDeleteStaff = (id: number) => {
    setStaff(staff.filter(member => member.id !== id));
    toast({
      title: "Staff member removed successfully",
    });
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Staff Member</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
              <DialogDescription>
                Add a new staff member to your team.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select 
                    value={newStaff.position} 
                    onValueChange={(value) => setNewStaff({ ...newStaff, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.map(position => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input
                  id="skills"
                  value={newStaff.skills}
                  onChange={(e) => setNewStaff({ ...newStaff, skills: e.target.value })}
                  placeholder="Haircuts, Coloring, Styling"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={newStaff.bio}
                  onChange={(e) => setNewStaff({ ...newStaff, bio: e.target.value })}
                  placeholder="Brief description of experience and expertise"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddStaff}>Add Staff Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.position}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingStaff({
                          id: member.id,
                          name: member.name,
                          position: member.position,
                          email: member.email,
                          phone: member.phone,
                          skills: member.skills.join(', '),
                          bio: member.bio
                        })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader>
                        <DialogTitle>Edit Staff Member</DialogTitle>
                      </DialogHeader>
                      {editingStaff && (
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-name">Name</Label>
                              <Input
                                id="edit-name"
                                value={editingStaff.name}
                                onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-position">Position</Label>
                              <Select 
                                value={editingStaff.position} 
                                onValueChange={(value) => setEditingStaff({ ...editingStaff, position: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {positionOptions.map(position => (
                                    <SelectItem key={position} value={position}>
                                      {position}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-email">Email</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={editingStaff.email}
                                onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-phone">Phone</Label>
                              <Input
                                id="edit-phone"
                                value={editingStaff.phone}
                                onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="edit-skills">Skills (comma separated)</Label>
                            <Input
                              id="edit-skills"
                              value={editingStaff.skills}
                              onChange={(e) => setEditingStaff({ ...editingStaff, skills: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-bio">Bio</Label>
                            <Textarea
                              id="edit-bio"
                              value={editingStaff.bio}
                              onChange={(e) => setEditingStaff({ ...editingStaff, bio: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button onClick={handleUpdateStaff}>Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDeleteStaff(member.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-sm">{member.email}</p>
                  <p className="text-sm">{member.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Skills</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.skills.map((skill, index) => (
                      <span key={index} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bio</p>
                  <p className="text-sm">{member.bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PartnerStaff;
