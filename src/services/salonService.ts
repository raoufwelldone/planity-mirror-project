
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
}

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export interface Stylist {
  id: string;
  salon_id: string;
  name: string;
  specialty: string;
  experience: string;
  bio: string;
  image_url: string;
}

export interface Availability {
  id: string;
  stylist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
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
      const { data: serviceIds, error: serviceError } = await supabase
        .from('services')
        .select('salon_id')
        .ilike('name', `%${filters.service}%`);

      if (serviceError) {
        console.error("Error fetching service IDs:", serviceError);
        throw serviceError;
      }

      if (serviceIds && serviceIds.length > 0) {
        query = query.in('id', serviceIds.map(s => s.salon_id));
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
  try {
    console.log("Getting salon by user ID:", userId);
    
    // First, check if the user has a salon profile linked
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('salon_id')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }
    
    // If the user has a salon_id in their profile, fetch that salon
    if (profileData?.salon_id) {
      return getSalonById(profileData.salon_id);
    }
    
    // Direct lookup in salons table
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error in getSalonByUserId:", error);
      throw error;
    }

    console.log("Salon for user:", data?.name || "No salon found");
    return data as Salon | null;
  } catch (error) {
    console.error('Error fetching salon by user ID:', error);
    return null;
  }
};

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

export const getStylistAvailability = async (stylistId: string) => {
  try {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('stylist_id', stylistId);

    if (error) throw error;
    
    return data as Availability[];
  } catch (error) {
    console.error('Error fetching availability:', error);
    return [];
  }
};

export const getAvailableTimeSlots = async (
  stylistId: string, 
  date: Date
) => {
  try {
    const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // Get stylist's availability for the given day
    const { data: availData, error: availError } = await supabase
      .from('availability')
      .select('*')
      .eq('stylist_id', stylistId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);
      
    if (availError) throw availError;
    if (!availData || availData.length === 0) {
      return [];
    }

    // Get stylist's booked appointments for the given date
    const dateStr = date.toISOString().split('T')[0];
    const { data: bookedData, error: bookedError } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('stylist_id', stylistId)
      .eq('appointment_date', dateStr)
      .in('status', ['pending', 'confirmed']);
      
    if (bookedError) throw bookedError;

    // Generate available time slots
    const availability = availData[0];
    const startTime = new Date(`${dateStr}T${availability.start_time}`);
    const endTime = new Date(`${dateStr}T${availability.end_time}`);
    
    // Create 30-minute slots
    const slots = [];
    let currentSlot = new Date(startTime);
    
    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);
      
      // Check if slot is available
      const isBooked = (bookedData || []).some(booking => {
        const bookingStart = new Date(`${dateStr}T${booking.start_time}`);
        const bookingEnd = new Date(`${dateStr}T${booking.end_time}`);
        return (
          (currentSlot >= bookingStart && currentSlot < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (currentSlot <= bookingStart && slotEnd >= bookingEnd)
        );
      });
      
      if (!isBooked) {
        const hours = currentSlot.getHours().toString().padStart(2, '0');
        const minutes = currentSlot.getMinutes().toString().padStart(2, '0');
        slots.push({
          time: `${hours}:${minutes}`,
          available: true
        });
      }
      
      // Move to next slot
      currentSlot = new Date(slotEnd);
    }
    
    return slots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    return [];
  }
};
