import type { BusTrip, RouteMetadata, RouteOrigin } from "../types/schedule";

export const ROUTE_METADATA: Record<RouteOrigin, RouteMetadata> = {
  "Noble Crystal": {
    name: "Noble Crystal",
    pickupPoint: "In front of Block C",
    operatingHours: "07:30 – 20:30",
    blockInfo: "Block C main entrance",
    color: "#3B82F6", // vibrant modern blue
    badgeBg: "rgba(59, 130, 246, 0.15)",
    borderColor: "rgba(59, 130, 246, 0.4)",
  },
  "Crescent Campus": {
    name: "Crescent Campus",
    pickupPoint: "Crescent Plaza Canopy",
    operatingHours: "09:45 – 21:30",
    blockInfo: "Plaza Canopy Waiting Area",
    color: "#10B981", // emerald green
    badgeBg: "rgba(16, 185, 129, 0.15)",
    borderColor: "rgba(16, 185, 129, 0.4)",
  },
};

const NOBLE_CRYSTAL_TIMES = [
  "07:30",
  "08:40",
  "09:20",
  "11:00",
  "12:50",
  "13:30",
  "14:30",
  "16:00",
  "18:00",
  "19:00",
  "20:30",
];

const CRESCENT_CAMPUS_TIMES = [
  "09:45",
  "11:30",
  "12:05",
  "13:10",
  "14:00",
  "15:00",
  "17:10",
  "18:30",
  "20:00",
  "20:50",
  "21:30",
];

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export const NOBLE_CRYSTAL_TRIPS: BusTrip[] = NOBLE_CRYSTAL_TIMES.map(
  (time, idx) => ({
    id: `nc-${idx + 1}`,
    departureTime: time,
    departureMinutes: timeToMinutes(time),
    origin: "Noble Crystal",
    destination: "Crescent Campus",
    pickupLocation: "In front of Block C",
    dropoffLocation: "Crescent Plaza Canopy (Crescent Campus)",
    estimatedDurationMinutes: 20,
    notes: "Boarding begins 5 minutes prior to departure. Please arrive early.",
  }),
);

export const CRESCENT_CAMPUS_TRIPS: BusTrip[] = CRESCENT_CAMPUS_TIMES.map(
  (time, idx) => ({
    id: `cc-${idx + 1}`,
    departureTime: time,
    departureMinutes: timeToMinutes(time),
    origin: "Crescent Campus",
    destination: "Noble Crystal",
    pickupLocation: "Crescent Plaza Canopy",
    dropoffLocation: "In front of Block C (Noble Crystal)",
    estimatedDurationMinutes: 20,
    notes: "Boarding begins 5 minutes prior to departure. Please arrive early.",
  }),
);

// All trips merged in exact chronological order
export const ALL_SCHEDULED_TRIPS: BusTrip[] = [
  ...NOBLE_CRYSTAL_TRIPS,
  ...CRESCENT_CAMPUS_TRIPS,
].sort((a, b) => a.departureMinutes - b.departureMinutes);

export const GENERAL_INFO = {
  organization: "Fulbright Residential Life",
  document: "Shuttle Bus Schedule",
  effectiveDate: "Effective from 03 September 2026",
  operatingDays: "Monday to Friday (Weekdays only)",
  weekendPolicy: "No bus on weekends and public holidays",
  estimatedTransit: "Approx. 15 – 20 minutes depending on traffic conditions",
};
