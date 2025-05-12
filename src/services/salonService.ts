
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
  let query = supabase.from('salons').select('*');

  if (filters?.location) {
    query = query.ilike('city', `%${filters.location}%`);
  }

  if (filters?.service) {
    const { data: serviceIds } = await supabase
      .from('services')
      .select('salon_id')
      .ilike('name', `%${filters.service}%`);

    if (serviceIds && serviceIds.length > 0) {
      query = query.in('id', serviceIds.map(s => s.salon_id));
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching salons:', error);
    return [];
  }

  return data as Salon[];
};

export const getSalonById = async (id: string) => {
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching salon:', error);
    return null;
  }

  return data as Salon;
};

export const getSalonServices = async (salonId: string) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('salon_id', salonId);

  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }

  return data as Service[];
};

export const getSalonStylists = async (salonId: string) => {
  const { data, error } = await supabase
    .from('stylists')
    .select('*')
    .eq('salon_id', salonId);

  if (error) {
    console.error('Error fetching stylists:', error);
    return [];
  }

  return data as Stylist[];
};

export const getStylistAvailability = async (stylistId: string) => {
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('stylist_id', stylistId);

  if (error) {
    console.error('Error fetching availability:', error);
    return [];
  }

  return data as Availability[];
};

export const getAvailableTimeSlots = async (
  stylistId: string, 
  date: Date
) => {
  const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Get stylist's availability for the given day
  const { data: availData, error: availError } = await supabase
    .from('availability')
    .select('*')
    .eq('stylist_id', stylistId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_available', true);
    
  if (availError || !availData || availData.length === 0) {
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
    
  if (bookedError) {
    console.error('Error fetching booked appointments:', bookedError);
    return [];
  }

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
      slots.push({
        time: currentSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        available: true
      });
    }
    
    // Move to next slot
    currentSlot = new Date(slotEnd);
  }
  
  return slots;
};
