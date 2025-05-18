
import { supabase } from "@/integrations/supabase/client";
import type { Salon } from "./models";

/**
 * Gets a salon associated with a user ID
 * Checks direct relationship first, then tries profiles table
 */
export const getUserSalon = async (userId: string): Promise<Salon | null> => {
  if (!userId) {
    console.log("No user ID provided");
    return null;
  }

  try {
    console.log("Getting salon by user ID:", userId);
    
    // First try direct relationship
    const { data: directData, error: directError } = await supabase
      .from('salons')
      .select('*')
      .eq('user_id', userId);
    
    if (directError) {
      console.error("Error in direct salon lookup:", directError);
    } else if (directData && directData.length > 0) {
      console.log("Salon found via direct relationship:", directData[0].name);
      return directData[0] as Salon;
    }
    
    // If no direct relationship, check profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('salon_id')
      .eq('id', userId);
    
    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else if (profileData && profileData.length > 0 && profileData[0].salon_id) {
      const salonId = profileData[0].salon_id;
      
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('*')
        .eq('id', salonId);
      
      if (salonError) {
        console.error("Error fetching salon by profile salon_id:", salonError);
      } else if (salonData && salonData.length > 0) {
        console.log("Salon found via profile relation:", salonData[0].name);
        return salonData[0] as Salon;
      }
    }
    
    console.log("No salon found for user:", userId);
    return null;
  } catch (error) {
    console.error('Error fetching salon by user ID:', error);
    return null;
  }
};

/**
 * Alias for getUserSalon
 */
export const getSalonByUserId = async (userId: string): Promise<Salon | null> => {
  return getUserSalon(userId);
};
