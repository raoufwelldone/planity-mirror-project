
import { supabase } from "@/integrations/supabase/client";

export const deleteSalon = async (id: string): Promise<boolean> => {
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
