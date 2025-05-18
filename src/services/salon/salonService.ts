
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
  user_id?: string;
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
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('salon_id')
        .ilike('name', `%${filters.service}%`);

      if (serviceError) {
        console.error("Error fetching service IDs:", serviceError);
        throw serviceError;
      }

      if (serviceData && serviceData.length > 0) {
        const salonIds = serviceData.map(s => s.salon_id);
        query = query.in('id', salonIds);
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

export const getSalonByUserId = async (userId: string): Promise<Salon | null> => {
  if (!userId) {
    console.log("No user ID provided");
    return null;
  }

  try {
    console.log("Getting salon by user ID:", userId);
    
    // First check if salon exists with direct user_id reference
    const { data: directData, error: directError } = await supabase
      .from('salons')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (directError && directError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" error, which is expected if no salon is found
      console.error("Error in direct salon lookup:", directError);
      throw directError;
    }
    
    // If found via direct relationship, return it
    if (directData) {
      console.log("Salon found via direct relationship:", directData.name);
      return directData as Salon;
    }
    
    // If not found via direct relationship, check profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('salon_id')
      .eq('id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }
    
    // Check if profile has a salon_id
    if (profileData?.salon_id) {
      const salonId = profileData.salon_id;
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('*')
        .eq('id', salonId)
        .single();
      
      if (salonError && salonError.code !== 'PGRST116') {
        console.error("Error fetching salon by profile salon_id:", salonError);
        throw salonError;
      }
      
      if (salonData) {
        console.log("Salon found via profile relation:", salonData.name);
        return salonData as Salon;
      }
    }
    
    console.log("No salon found for user:", userId);
    return null;
  } catch (error) {
    console.error('Error fetching salon by user ID:', error);
    return null;
  }
};

export const createSalon = async (salonData: Omit<Salon, 'id' | 'rating' | 'reviews_count'> & { user_id: string }) => {
  try {
    const { data, error } = await supabase
      .from('salons')
      .insert({
        ...salonData,
        rating: 0,
        reviews_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating salon:", error);
      throw error;
    }

    return data as Salon;
  } catch (error) {
    console.error('Error creating salon:', error);
    throw error;
  }
};

export const updateSalon = async (id: string, salonData: Partial<Salon>) => {
  try {
    const { data, error } = await supabase
      .from('salons')
      .update(salonData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating salon:", error);
      throw error;
    }

    return data as Salon;
  } catch (error) {
    console.error('Error updating salon:', error);
    throw error;
  }
};

export const deleteSalon = async (id: string) => {
  try {
    const { error } = await supabase
      .from('salons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting salon:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting salon:', error);
    throw error;
  }
};
