
import { supabase } from "@/integrations/supabase/client";
import type { Salon } from "./salonService";

// Extract the complex user-salon relationship logic to its own file
export const getUserSalon = async (userId: string): Promise<Salon | null> => {
  if (!userId) {
    console.log("No user ID provided");
    return null;
  }

  try {
    console.log("Getting salon by user ID:", userId);
    
    // First try direct relationship
    try {
      const { data } = await supabase
        .from('salons')
        .select('*')
        .eq('user_id', userId)
        .limit(1);
      
      if (data && data.length > 0) {
        console.log("Salon found via direct relationship:", data[0].name);
        return data[0] as Salon;
      }
    } catch (directError) {
      console.error("Error in direct salon lookup:", directError);
      // Continue to next method
    }
    
    // If no direct relationship, check profile
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('salon_id')
        .eq('id', userId)
        .limit(1);
      
      if (profileData && profileData.length > 0 && profileData[0]?.salon_id) {
        const salonId = profileData[0].salon_id;
        
        const { data: salonData } = await supabase
          .from('salons')
          .select('*')
          .eq('id', salonId)
          .limit(1);
        
        if (salonData && salonData.length > 0) {
          console.log("Salon found via profile relation:", salonData[0].name);
          return salonData[0] as Salon;
        }
      }
    } catch (profileError) {
      console.error("Error fetching profile or salon:", profileError);
    }
    
    console.log("No salon found for user:", userId);
    return null;
  } catch (error) {
    console.error('Error fetching salon by user ID:', error);
    return null;
  }
};
