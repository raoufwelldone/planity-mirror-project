
// Centralizing the Salon type definition to avoid circular dependencies
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
  user_id?: string;
}

// Common types for salon operations
export type CreateSalonData = Omit<Salon, 'id' | 'rating' | 'reviews_count'> & { user_id: string };
export type UpdateSalonData = Partial<Salon>;
