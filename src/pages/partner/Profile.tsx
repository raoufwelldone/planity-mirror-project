import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalonGallery } from "@/components/salon/SalonGallery";
import { ServiceList } from "@/components/services/ServiceList";
import { StaffList } from "@/components/staff/StaffList";

const PartnerProfile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [salonId, setSalonId] = useState<string | null>(null);

  // Profile form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [city, setCity] = useState(user?.city || "");
  const [state, setState] = useState(user?.state || "");
  const [zip, setZip] = useState(user?.zip || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [businessType, setBusinessType] = useState(user?.businessType || "");
  const [description, setDescription] = useState(user?.description || "");
  const [hours, setHours] = useState(user?.hours || "");

  useEffect(() => {
    const fetchSalonData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Check if we have an existing salon
        const { data: existingSalons, error: salonError } = await supabase
          .from("salons")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (salonError) throw salonError;

        if (existingSalons) {
          // Salon exists - load data
          setSalonId(existingSalons.id);
          
          setName(existingSalons.name || user.name);
          setPhone(existingSalons.phone || "");
          setAddress(existingSalons.address || "");
          setCity(existingSalons.city || "");
          setWebsite(existingSalons.website || "");
          setDescription(existingSalons.description || "");
          setHours(existingSalons.hours || "");
          
          // Update user state to keep everything in sync
          if (user) {
            updateUser({
              ...user,
              name: existingSalons.name || user.name,
              phone: existingSalons.phone || user.phone,
              address: existingSalons.address || user.address,
              city: existingSalons.city || user.city,
              website: existingSalons.website || user.website,
              description: existingSalons.description || user.description,
              hours: existingSalons.hours || user.hours
            });
          }
        } else {
          // No salon yet - create one with user data
          const { data: newSalon, error: createError } = await supabase
            .from("salons")
            .insert({
              id: user.id,
              name: user.name,
              address: "",
              city: "",
            })
            .select();

          if (createError) throw createError;
          
          if (newSalon && newSalon.length > 0) {
            setSalonId(newSalon[0].id);
          }
        }
      } catch (error: any) {
        console.error("Error fetching salon data:", error);
        toast({
          variant: "destructive",
          title: "Error loading salon data",
          description: error.message || "Failed to load salon information",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSalonData();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !salonId) return;
    
    setIsSaving(true);
    try {
      // Update salon data
      const { error: salonError } = await supabase
        .from("salons")
        .update({
          name,
          phone,
          address,
          city,
          website,
          description,
          hours,
        })
        .eq("id", salonId);

      if (salonError) throw salonError;
      
      // Update user data
      const updatedUser = {
        ...user,
        name,
        email,
        phone,
        address,
        city,
        state,
        zip,
        website,
        businessType,
        description,
        hours
      };
      
      await updateUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your salon profile has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Salon Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Salon Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Salon Name</Label>
                    <Input 
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input 
                        id="zip"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Input 
                      id="businessType"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      placeholder="Hair Salon, Spa, Nail Salon, etc."
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Describe your salon and services..."
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="hours">Business Hours</Label>
                    <Textarea 
                      id="hours"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      rows={4}
                      placeholder="Monday: 9AM-6PM, Tuesday: 9AM-6PM, etc."
                    />
                  </div>
                </div>
                
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle>Salon Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              {salonId ? (
                <SalonGallery salonId={salonId} editable />
              ) : (
                <div className="text-center py-8">
                  Please save your salon profile first.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
            </CardHeader>
            <CardContent>
              {salonId ? (
                <ServiceList salonId={salonId} editable />
              ) : (
                <div className="text-center py-8">
                  Please save your salon profile first.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
            </CardHeader>
            <CardContent>
              {salonId ? (
                <StaffList salonId={salonId} editable />
              ) : (
                <div className="text-center py-8">
                  Please save your salon profile first.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnerProfile;
