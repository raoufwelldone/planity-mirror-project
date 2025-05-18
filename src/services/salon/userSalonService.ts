
import { supabase } from "@/integrations/supabase/client";
import type { Salon } from "./models";

export const getUserSalon = async (userId: string): Promise<Salon | null> => {
  if (!userId) {
    console.log("No user ID provided");
    return null;
  }

  try {
    console.log("Getting salon by user ID:", userId);
    
    // First try direct relationship
    try {
      // Using maybeSingle() instead of limit(1) to fix type instantiation issue
      const { data: directSalon, error: directError } = await supabase
        .from('salons')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (directError) {
        console.error("Error in direct salon lookup:", directError);
      } else if (directSalon) {
        console.log("Salon found via direct relationship:", directSalon.name);
        return directSalon as Salon;
      }
    } catch (directError) {
      console.error("Exception in direct salon lookup:", directError);
      // Continue to next method
    }
    
    // If no direct relationship, check profile
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('salon_id')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else if (profileData?.salon_id) {
        const salonId = profileData.salon_id;
        
        const { data: salonData, error: salonError } = await supabase
          .from('salons')
          .select('*')
          .eq('id', salonId)
          .maybeSingle();
        
        if (salonError) {
          console.error("Error fetching salon by profile salon_id:", salonError);
        } else if (salonData) {
          console.log("Salon found via profile relation:", salonData.name);
          return salonData as Salon;
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
