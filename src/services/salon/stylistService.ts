
import { supabase } from "@/integrations/supabase/client";

export interface Stylist {
  id: string;
  salon_id: string;
  name: string;
  specialty: string;
  experience: string;
  bio: string;
  image_url: string;
}

export const getSalonStylists = async (salonId: string) => {
  try {
    const { data, error } = await supabase
      .from('stylists')
      .select('*')
      .eq('salon_id', salonId);

    if (error) throw error;
    
    return data as Stylist[];
  } catch (error) {
    console.error('Error fetching stylists:', error);
    return [];
  }
};
