import React, { useState } from 'react';
import { useCurrentTime } from './hooks/useCurrentTime';
import { ALL_SCHEDULED_TRIPS } from './data/scheduleData';
import { getNextBusInfo, isWeekday, formatReadableDate } from './utils/timeUtils';
import type { BusTrip } from './types/schedule';
import { Header } from './components/Header';
import { CurrentTimeBanner } from './components/CurrentTimeBanner';
import { VerticalTimeline } from './components/VerticalTimeline';
import { TripModal } from './components/TripModal';
import { GeneralDetails } from './components/GeneralDetails';
import { SimulationControls } from './components/SimulationControls';

export const App: React.FC = () => {
  const { currentTime, isSimulated, setSimulatedTime, resetToRealTime } = useCurrentTime();
  const [selectedTrip, setSelectedTrip] = useState<BusTrip | null>(null);

  const todayIsWeekday = isWeekday(currentTime);
  const { nextTrip, isServiceEnded, hasNoServiceToday } = getNextBusInfo(
    ALL_SCHEDULED_TRIPS,
    currentTime
  );

  return (
    <div className="app-container">
      {/* 1. Header with branding and date/service status */}
      <Header
        isWeekday={todayIsWeekday}
        isSimulated={isSimulated}
        dateStr={formatReadableDate(currentTime)}
      />

      {/* 2. Current Time Clock & Red Next Bus Countdown */}
      <CurrentTimeBanner
        currentTime={currentTime}
        nextTrip={nextTrip}
        isServiceEnded={isServiceEnded}
        hasNoServiceToday={hasNoServiceToday}
        onSelectTrip={(trip) => setSelectedTrip(trip)}
      />

      {/* 3. Main Vertical Timeline with departures on either side and Red Pointer */}
      <VerticalTimeline
        trips={ALL_SCHEDULED_TRIPS}
        currentTime={currentTime}
        nextTripId={nextTrip?.id || null}
        onSelectTrip={(trip) => setSelectedTrip(trip)}
        hasNoServiceToday={hasNoServiceToday}
      />

      {/* 4. Additional Route Details and Policies at the Bottom */}
      <GeneralDetails />

      {/* 5. Timeslot Popup / Modal with Pickup & Drop-off details */}
      <TripModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />

      {/* 6. Simulation & Testing Controls */}
      <SimulationControls
        isSimulated={isSimulated}
        onSetTime={setSimulatedTime}
        onReset={resetToRealTime}
      />
    </div>
  );
};

export default App;
