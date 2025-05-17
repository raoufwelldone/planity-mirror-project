
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

// Fix for type instantiation issue
export const getSalonByUserId = async (userId: string): Promise<Salon | null> => {
  try {
    console.log("Getting salon by user ID:", userId);
    
    // First check if user has a salon_id in their profile
    const profileResponse = await supabase
      .from('profiles')
      .select('salon_id')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileResponse.error && profileResponse.error.code !== 'PGRST116') {
      console.error("Error fetching profile:", profileResponse.error);
      throw profileResponse.error;
    }
    
    // If profile has a salon_id, fetch that salon directly
    if (profileResponse.data?.salon_id) {
      const salonResponse = await supabase
        .from('salons')
        .select('*')
        .eq('id', profileResponse.data.salon_id)
        .maybeSingle();
        
      if (salonResponse.error) {
        console.error("Error fetching salon by profile salon_id:", salonResponse.error);
        throw salonResponse.error;
      }
      
      if (salonResponse.data) {
        console.log("Salon found via profile relation:", salonResponse.data.name);
        return salonResponse.data as Salon;
      }
    }
    
    // If no salon found via profile, check direct user_id relationship in salons table
    const directSalonResponse = await supabase
      .from('salons')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (directSalonResponse.error) {
      console.error("Error in direct salon lookup:", directSalonResponse.error);
      throw directSalonResponse.error;
    }

    if (directSalonResponse.data) {
      console.log("Salon found via direct relationship:", directSalonResponse.data.name);
      return directSalonResponse.data as Salon;
    }
    
    console.log("No salon found for user:", userId);
    return null;
  } catch (error) {
    console.error('Error fetching salon by user ID:', error);
    return null;
  }
};
