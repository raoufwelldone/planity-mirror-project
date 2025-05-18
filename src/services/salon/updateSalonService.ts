
import { supabase } from "@/integrations/supabase/client";
import type { Salon, UpdateSalonData } from "./models";

export const updateSalon = async (id: string, salonData: UpdateSalonData): Promise<Salon> => {
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
