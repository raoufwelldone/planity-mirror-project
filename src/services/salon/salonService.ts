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

// Fixed function to resolve type instantiation error
export const getSalonByUserId = async (userId: string): Promise<Salon | null> => {
  try {
    console.log("Getting salon by user ID:", userId);
    
    // Step 1: Check if user has a salon_id in their profile - use maybeSingle to avoid excessive type instantiation
    const profileResult = await supabase
      .from('profiles')
      .select('salon_id')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileResult.error && profileResult.error.code !== 'PGRST116') {
      console.error("Error fetching profile:", profileResult.error);
      throw profileResult.error;
    }
    
    // Step 2: If profile has a salon_id, fetch that salon directly
    if (profileResult.data?.salon_id) {
      const salonResult = await supabase
        .from('salons')
        .select('*')
        .eq('id', profileResult.data.salon_id)
        .maybeSingle();
        
      if (salonResult.error) {
        console.error("Error fetching salon by profile salon_id:", salonResult.error);
        throw salonResult.error;
      }
      
      if (salonResult.data) {
        console.log("Salon found via profile relation:", salonResult.data.name);
        return salonResult.data as Salon;
      }
    }
    
    // Step 3: Check direct user_id relationship - use maybeSingle to avoid excessive type instantiation
    const directResult = await supabase
      .from('salons')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (directResult.error) {
      console.error("Error in direct salon lookup:", directResult.error);
      throw directResult.error;
    }

    if (directResult.data) {
      console.log("Salon found via direct relationship:", directResult.data.name);
      return directResult.data as Salon;
    }
    
    console.log("No salon found for user:", userId);
    return null;
  } catch (error) {
    console.error('Error fetching salon by user ID:', error);
    return null;
  }
};
