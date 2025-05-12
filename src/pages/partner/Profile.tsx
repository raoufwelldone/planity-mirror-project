import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, Globe } from "lucide-react";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [city, setCity] = useState(user?.city || "");
  const [state, setState] = useState(user?.state || "");
  const [zip, setZip] = useState(user?.zip || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [description, setDescription] = useState(user?.description || "");
  const [businessType, setBusinessType] = useState(user?.businessType || "salon");
  const [hours, setHours] = useState(user?.hours || "9am - 5pm");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
      description,
      businessType,
      hours,
    };

    try {
      await updateUser(updatedUser);
      toast({
        title: "Profile updated successfully!",
        description: "Your profile has been updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating profile.",
        description: error.message || "Failed to update profile.",
      });
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Partner Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center space-x-4">
            <Badge>Verified Partner</Badge>
          </div>
          <Separator />
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Business Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  type="url"
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  type="text"
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  type="text"
                  id="zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="businessType">Business Type</Label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salon">Salon</SelectItem>
                  <SelectItem value="spa">Spa</SelectItem>
                  <SelectItem value="barbershop">Barbershop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hours">Hours of Operation</Label>
              <Input
                type="text"
                id="hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
              />
            </div>
            <Button type="submit">Update Profile</Button>
          </form>
          <Separator className="my-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-muted">
              <CardContent className="flex items-center space-x-4">
                <MapPin className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-gray-600">{address}, {city}, {state} {zip}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted">
              <CardContent className="flex items-center space-x-4">
                <Phone className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-gray-600">{phone}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted">
              <CardContent className="flex items-center space-x-4">
                <Mail className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-gray-600">{email}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted">
              <CardContent className="flex items-center space-x-4">
                <Clock className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Hours</p>
                  <p className="text-gray-600">{hours}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted">
              <CardContent className="flex items-center space-x-4">
                <Globe className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Website</p>
                  <p className="text-gray-600">{website}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
