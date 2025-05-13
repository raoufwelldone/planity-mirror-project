
import { supabase } from "@/integrations/supabase/client";

export interface Salon {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
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

      if (serviceError) throw serviceError;

      if (serviceIds && serviceIds.length > 0) {
        query = query.in('id', serviceIds.map(s => s.salon_id));
      } else {
        // No salons offer this service
        return [];
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return data as Salon[];
  } catch (error) {
    console.error('Error fetching salons:', error);
    return [];
  }
};

export const getSalonById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return data as Salon;
  } catch (error) {
    console.error('Error fetching salon:', error);
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
