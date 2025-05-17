
import { supabase } from "@/integrations/supabase/client";

export interface Availability {
  id: string;
  stylist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

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
