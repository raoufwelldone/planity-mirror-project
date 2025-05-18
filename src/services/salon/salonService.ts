
// This file serves as a central point to re-export all salon services

import { Salon, CreateSalonData, UpdateSalonData } from './models';
import { getSalons } from './getSalonsService';
import { getSalonById } from './getSalonByIdService';
import { getSalonByUserId } from './userSalonService';
import { createSalon } from './createSalonService';
import { updateSalon } from './updateSalonService';
import { deleteSalon } from './deleteSalonService';

// Re-export all types and functions
export type {
  Salon,
  CreateSalonData,
  UpdateSalonData
};

export {
  getSalons,
  getSalonById,
  getSalonByUserId,
  createSalon,
  updateSalon,
  deleteSalon
};
