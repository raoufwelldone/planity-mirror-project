
import { supabase } from "@/integrations/supabase/client";

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export const getSalonServices = async (salonId: string) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId);

    if (error) throw error;
    
    return data as Service[];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
};
