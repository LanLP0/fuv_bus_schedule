import type { BusTrip } from '../types/schedule';

export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  // 0 is Sunday, 6 is Saturday
  return day >= 1 && day <= 5;
}

export function formatTimeDigits(num: number): string {
  return num.toString().padStart(2, '0');
}

export function formatClockTime(date: Date): string {
  const h = formatTimeDigits(date.getHours());
  const m = formatTimeDigits(date.getMinutes());
  const s = formatTimeDigits(date.getSeconds());
  return `${h}:${m}:${s}`;
}

export function formatReadableDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getCurrentDayMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export interface CountdownResult {
  hours: number;
  minutes: number;
  totalMinutes: number;
  formatted: string;
  isBoarding: boolean;
}

export function calculateCountdown(targetMinutes: number, currentDate: Date): CountdownResult {
  const currentTotalSeconds =
    currentDate.getHours() * 3600 +
    currentDate.getMinutes() * 60 +
    currentDate.getSeconds();
  const targetTotalSeconds = targetMinutes * 60;

  const diffSeconds = targetTotalSeconds - currentTotalSeconds;

  if (diffSeconds <= 0) {
    return {
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
      formatted: 'Now boarding',
      isBoarding: true,
    };
  }

  const totalMinutes = Math.floor(diffSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let formatted = '';
  let isBoarding = false;

  if (hours === 0 && minutes === 0) {
    formatted = 'Now boarding';
    isBoarding = true;
  } else if (hours > 0) {
    formatted = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  } else {
    formatted = `${minutes}m`;
  }

  return {
    hours,
    minutes,
    totalMinutes,
    formatted,
    isBoarding,
  };
}

export function getTripRemainingTime(
  tripDepartureMinutes: number,
  currentDate: Date,
  hasNoServiceToday: boolean = false
): {
  text: string;
  isPast: boolean;
  isBoarding: boolean;
} {
  if (hasNoServiceToday) {
    return { text: '', isPast: false, isBoarding: false };
  }

  const currentTotalSeconds =
    currentDate.getHours() * 3600 +
    currentDate.getMinutes() * 60 +
    currentDate.getSeconds();
  const targetTotalSeconds = tripDepartureMinutes * 60;
  const diffSeconds = targetTotalSeconds - currentTotalSeconds;

  if (diffSeconds < 0) {
    return { text: 'Departed', isPast: true, isBoarding: false };
  }

  const totalMinutes = Math.floor(diffSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0 && minutes === 0) {
    return { text: 'Now boarding', isPast: false, isBoarding: true };
  }

  if (hours > 0) {
    return {
      text: minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`,
      isPast: false,
      isBoarding: false,
    };
  }

  return {
    text: `${minutes}m`,
    isPast: false,
    isBoarding: false,
  };
}

export function getNextBusInfo(
  trips: BusTrip[],
  currentDate: Date,
  forceWeekday: boolean = false
): {
  nextTrip: BusTrip | null;
  nextTripIndex: number;
  isServiceEnded: boolean;
  hasNoServiceToday: boolean;
} {
  const weekday = forceWeekday || isWeekday(currentDate);

  if (!weekday) {
    return {
      nextTrip: null,
      nextTripIndex: -1,
      isServiceEnded: false,
      hasNoServiceToday: true,
    };
  }

  const currentMinutes = getCurrentDayMinutes(currentDate);
  const currentSeconds = currentDate.getSeconds();
  const currentTimeInSeconds = currentMinutes * 60 + currentSeconds;

  // Find the earliest trip whose departure is in the future
  for (let i = 0; i < trips.length; i++) {
    const tripSeconds = trips[i].departureMinutes * 60;
    if (tripSeconds > currentTimeInSeconds) {
      return {
        nextTrip: trips[i],
        nextTripIndex: i,
        isServiceEnded: false,
        hasNoServiceToday: false,
      };
    }
  }

  // If no upcoming trip found today
  return {
    nextTrip: null,
    nextTripIndex: -1,
    isServiceEnded: true,
    hasNoServiceToday: false,
  };
}

export function calculateTimelineProgress(
  currentDate: Date,
  trips: BusTrip[]
): {
  progressPercentage: number;
  status: 'before_first' | 'in_range' | 'after_last';
} {
  if (trips.length === 0) return { progressPercentage: 0, status: 'before_first' };

  const firstTripMinutes = trips[0].departureMinutes;
  const lastTripMinutes = trips[trips.length - 1].departureMinutes;
  const currentMinutesWithSeconds =
    currentDate.getHours() * 60 +
    currentDate.getMinutes() +
    currentDate.getSeconds() / 60;

  if (currentMinutesWithSeconds < firstTripMinutes) {
    return { progressPercentage: 0, status: 'before_first' };
  }

  if (currentMinutesWithSeconds > lastTripMinutes) {
    return { progressPercentage: 100, status: 'after_last' };
  }

  // Smooth interpolation along the schedule window
  const totalWindow = lastTripMinutes - firstTripMinutes;
  const elapsed = currentMinutesWithSeconds - firstTripMinutes;
  const percentage = Math.min(100, Math.max(0, (elapsed / totalWindow) * 100));

  return { progressPercentage: percentage, status: 'in_range' };
}
