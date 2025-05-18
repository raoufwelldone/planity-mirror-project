
import { supabase } from "@/integrations/supabase/client";
import type { Salon } from "./models";

export const getUserSalon = async (userId: string): Promise<Salon | null> => {
  if (!userId) {
    console.log("No user ID provided");
    return null;
  }

  try {
    console.log("Getting salon by user ID:", userId);
    
    // First try direct relationship - simplified query approach
    try {
      const { data: salons, error: directError } = await supabase
        .from('salons')
        .select('*')
        .eq('user_id', userId);
      
      if (directError) {
        console.error("Error in direct salon lookup:", directError);
      } else if (salons && salons.length > 0) {
        console.log("Salon found via direct relationship:", salons[0].name);
        return salons[0] as Salon;
      }
    } catch (directError) {
      console.error("Exception in direct salon lookup:", directError);
      // Continue to next method
    }
    
    // If no direct relationship, check profile - simplified query approach
    try {
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
    } catch (profileError) {
      console.error("Exception fetching profile or salon:", profileError);
    }
    
    console.log("No salon found for user:", userId);
    return null;
  } catch (error) {
    console.error('Error fetching salon by user ID:', error);
    return null;
  }
};

export const getSalonByUserId = async (userId: string): Promise<Salon | null> => {
  return getUserSalon(userId);
};
