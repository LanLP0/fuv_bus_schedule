export type RouteOrigin = 'Noble Crystal' | 'Crescent Campus';

export interface BusTrip {
  id: string;
  departureTime: string; // "HH:mm"
  departureMinutes: number; // minutes from 00:00 (e.g. 7:30 = 450)
  origin: RouteOrigin;
  destination: RouteOrigin;
  pickupLocation: string;
  dropoffLocation: string;
  estimatedDurationMinutes: number;
  notes?: string;
}

export interface RouteMetadata {
  name: RouteOrigin;
  pickupPoint: string;
  operatingHours: string;
  blockInfo?: string;
  color: string;
  badgeBg: string;
  borderColor: string;
}

export interface DayStatus {
  isWeekday: boolean;
  dayName: string;
  formattedDate: string;
  hasBusesToday: boolean;
  message?: string;
}
