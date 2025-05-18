
import { supabase } from "@/integrations/supabase/client";
import type { Salon, CreateSalonData } from "./models";

export const createSalon = async (salonData: CreateSalonData): Promise<Salon> => {
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
