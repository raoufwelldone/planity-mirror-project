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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper types for business hours
type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
type BusinessHour = {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

const defaultBusinessHours: BusinessHour[] = [
  { day: "Monday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
  { day: "Tuesday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
  { day: "Wednesday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
  { day: "Thursday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
  { day: "Friday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
  { day: "Saturday", isOpen: false, openTime: "09:00", closeTime: "17:00" },
  { day: "Sunday", isOpen: false, openTime: "09:00", closeTime: "17:00" },
];

// Generate time options
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      options.push(`${h}:${m}`);
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

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
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(defaultBusinessHours);

  // Parse stored hours string to BusinessHour[] if available
  const parseHoursString = (hoursString?: string) => {
    if (!hoursString) return defaultBusinessHours;
    
    try {
      return JSON.parse(hoursString) as BusinessHour[];
    } catch (e) {
      console.error("Error parsing hours string:", e);
      return defaultBusinessHours;
    }
  };
  
  // Stringify BusinessHour[] to store in database
  const stringifyHours = (hours: BusinessHour[]) => {
    return JSON.stringify(hours);
  };

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
          // Since state and zip aren't in the salon table, we keep them from user data
          // or initialize them as empty strings
          setState(user?.state || "");
          setZip(user?.zip || "");
          setWebsite(existingSalons.website || "");
          setBusinessType(businessType || "");
          setDescription(existingSalons.description || "");
          
          // Parse business hours if available
          setBusinessHours(parseHoursString(existingSalons.hours));
          
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
            });
          }
        } else {
          // No salon yet - create one with user data
          const { data: newSalon, error: createError } = await supabase
            .from("salons")
            .insert({
              id: user.id,
              name: user.name || "My Salon",
              address: "",
              city: "",
            })
            .select();

          if (createError) throw createError;
          
          if (newSalon && newSalon.length > 0) {
            setSalonId(newSalon[0].id);
            toast({
              title: "Salon profile created",
              description: "Your salon profile has been created successfully"
            });
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
    
    if (!user) return;
    
    setIsSaving(true);
    try {
      // First ensure we have a salon ID
      let currentSalonId = salonId;
      
      if (!currentSalonId) {
        // Create a new salon if we don't have one yet
        const { data: newSalon, error: createError } = await supabase
          .from("salons")
          .insert({
            id: user.id,
            name: name || "My Salon",
            address: address || "",
            city: city || "",
            hours: stringifyHours(businessHours),
          })
          .select();
          
        if (createError) throw createError;
        
        if (newSalon && newSalon.length > 0) {
          currentSalonId = newSalon[0].id;
          setSalonId(currentSalonId);
        } else {
          throw new Error("Failed to create salon profile");
        }
      }
      
      // Update salon data - don't include state and zip as they aren't in the salon table
      const { error: salonError } = await supabase
        .from("salons")
        .update({
          name,
          phone,
          address,
          city,
          website,
          description,
          hours: stringifyHours(businessHours),
        })
        .eq("id", currentSalonId);

      if (salonError) throw salonError;
      
      // Update user data - include state and zip here instead
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

  // Handle business hour changes
  const handleHourChange = (index: number, field: keyof BusinessHour, value: any) => {
    const updatedHours = [...businessHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setBusinessHours(updatedHours);
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
                  
                  <div className="space-y-4 md:col-span-2">
                    <Label>Business Hours</Label>
                    
                    {businessHours.map((dayHours, index) => (
                      <div key={dayHours.day} className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-3 sm:col-span-2 flex items-center space-x-2">
                          <Checkbox 
                            id={`day-${dayHours.day}`} 
                            checked={dayHours.isOpen}
                            onCheckedChange={(checked) => 
                              handleHourChange(index, 'isOpen', checked === true)
                            }
                          />
                          <Label htmlFor={`day-${dayHours.day}`}>{dayHours.day}</Label>
                        </div>
                        
                        <div className="col-span-4 sm:col-span-5">
                          <Select
                            value={dayHours.openTime}
                            onValueChange={(value) => handleHourChange(index, 'openTime', value)}
                            disabled={!dayHours.isOpen}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Opening Time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={`open-${dayHours.day}-${time}`} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-1 sm:col-span-1 text-center">to</div>
                        
                        <div className="col-span-4 sm:col-span-4">
                          <Select
                            value={dayHours.closeTime}
                            onValueChange={(value) => handleHourChange(index, 'closeTime', value)}
                            disabled={!dayHours.isOpen}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Closing Time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={`close-${dayHours.day}-${time}`} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
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
