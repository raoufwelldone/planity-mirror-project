
import { supabase } from "@/integrations/supabase/client";

export interface Salon {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  phone: string;
  website: string;
  hours: string;
  rating: number;
  reviews_count: number;
  image_url: string;
}

export const getSalons = async (filters?: { location?: string; service?: string }) => {
  try {
    console.log("Getting salons with filters:", filters);
    let query = supabase.from('salons').select('*');

    if (filters?.location) {
      query = query.ilike('city', `%${filters.location}%`);
    }

    if (filters?.service) {
      // First get salon IDs that offer this service
      const { data: serviceIds, error: serviceError } = await supabase
        .from('services')
        .select('salon_id')
        .ilike('name', `%${filters.service}%`);

      if (serviceError) {
        console.error("Error fetching service IDs:", serviceError);
        throw serviceError;
      }

      if (serviceIds && serviceIds.length > 0) {
        query = query.in('id', serviceIds.map(s => s.salon_id));
      } else {
        // No salons offer this service
        console.log("No salons found offering service:", filters.service);
        return [];
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error in getSalons:", error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} salons`);
    return data as Salon[];
  } catch (error) {
    console.error('Error fetching salons:', error);
    return [];
  }
};

export const getSalonById = async (id: string) => {
  try {
    console.log("Getting salon by ID:", id);
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error in getSalonById:", error);
      throw error;
    }
    
    console.log("Salon found:", data?.name);
    return data as Salon;
  } catch (error) {
    console.error('Error fetching salon:', error);
    return null;
  }
};

export const getSalonByUserId = async (userId: string) => {
  try {
    console.log("Getting salon by user ID:", userId);
    
    // First check if user has a salon_id in their profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('salon_id')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }
    
    // If profile has a salon_id, fetch that salon directly
    if (profileData?.salon_id) {
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('*')
        .eq('id', profileData.salon_id)
        .maybeSingle();
        
      if (salonError) {
        console.error("Error fetching salon by profile salon_id:", salonError);
        throw salonError;
      }
      
      if (salonData) {
        console.log("Salon found via profile relation:", salonData.name);
        return {
          id: salonData.id,
          name: salonData.name,
          description: salonData.description || "",
          address: salonData.address,
          city: salonData.city,
          state: salonData.state || "",
          zip: salonData.zip || "",
          latitude: salonData.latitude || 0,
          longitude: salonData.longitude || 0,
          phone: salonData.phone || "",
          website: salonData.website || "",
          hours: salonData.hours || "",
          rating: salonData.rating || 0,
          reviews_count: salonData.reviews_count || 0,
          image_url: salonData.image_url || ""
        };
      }
    }
    
    // If no salon found via profile, check direct user_id relationship in salons table
    const { data: directSalonData, error: directError } = await supabase
      .from('salons')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (directError) {
      console.error("Error in direct salon lookup:", directError);
      throw directError;
    }

    if (directSalonData) {
      console.log("Salon found via direct relationship:", directSalonData.name);
      return {
        id: directSalonData.id,
        name: directSalonData.name,
        description: directSalonData.description || "",
        address: directSalonData.address,
        city: directSalonData.city,
        state: directSalonData.state || "",
        zip: directSalonData.zip || "",
        latitude: directSalonData.latitude || 0,
        longitude: directSalonData.longitude || 0,
        phone: directSalonData.phone || "",
        website: directSalonData.website || "",
        hours: directSalonData.hours || "",
        rating: directSalonData.rating || 0,
        reviews_count: directSalonData.reviews_count || 0,
        image_url: directSalonData.image_url || ""
      };
    }
    
    console.log("No salon found for user:", userId);
    return null;
  } catch (error) {
    console.error('Error fetching salon by user ID:', error);
    return null;
  }
};
