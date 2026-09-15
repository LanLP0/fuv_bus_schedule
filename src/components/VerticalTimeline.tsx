import React, { useRef, useState, useEffect, useCallback } from "react";
import type { BusTrip } from "../types/schedule";
import { TimelineItem } from "./TimelineItem";
import { TimelinePointer } from "./TimelinePointer";

import { MapPin, Navigation } from "lucide-react";

interface VerticalTimelineProps {
  trips: BusTrip[];
  currentTime: Date;
  nextTripId: string | null;
  onSelectTrip: (trip: BusTrip) => void;
  hasNoServiceToday: boolean;
}

export const VerticalTimeline: React.FC<VerticalTimelineProps> = ({
  trips,
  currentTime,
  nextTripId,
  onSelectTrip,
  hasNoServiceToday,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [pointerTop, setPointerTop] = useState<number>(0);
  const [pointerVisible, setPointerVisible] = useState<boolean>(true);
  const [manualSideOverride, setManualSideOverride] = useState<
    "left" | "right" | null
  >(null);

  // Dynamically flip pointer to the empty column to avoid clipping cards
  const getDynamicPointerSide = (): "left" | "right" => {
    if (trips.length === 0) return "right";

    const currentSeconds =
      currentTime.getHours() * 3600 +
      currentTime.getMinutes() * 60 +
      currentTime.getSeconds();

    let closestTrip = trips[0];
    let minDiff = Infinity;

    for (const trip of trips) {
      const diff = Math.abs(trip.departureMinutes * 60 - currentSeconds);
      if (diff < minDiff) {
        minDiff = diff;
        closestTrip = trip;
      }
    }

    // If closest trip card is on the Left (Noble Crystal), position pointer on the Right.
    // If closest trip card is on the Right (Crescent Campus), position pointer on the Left.
    return closestTrip.origin === "Noble Crystal" ? "right" : "left";
  };

  const dynamicSide = getDynamicPointerSide();
  const effectiveSide = manualSideOverride ?? dynamicSide;

  // Compute pointer position based on actual DOM row positions
  const updatePointerPosition = useCallback(() => {
    if (!containerRef.current || trips.length === 0) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const currentSeconds =
      currentTime.getHours() * 3600 +
      currentTime.getMinutes() * 60 +
      currentTime.getSeconds();

    const firstTripSeconds = trips[0].departureMinutes * 60;
    const lastTripSeconds = trips[trips.length - 1].departureMinutes * 60;

    const getRowCenter = (index: number): number => {
      const rowEl = rowRefs.current[index];
      if (!rowEl) return 0;
      const rowRect = rowEl.getBoundingClientRect();
      return rowRect.top - containerRect.top + rowRect.height / 2;
    };

    if (currentSeconds <= firstTripSeconds) {
      // At or before the first trip
      const firstCenter = getRowCenter(0);
      setPointerTop(Math.max(10, firstCenter - 15));
      setPointerVisible(true);
      return;
    }

    if (currentSeconds >= lastTripSeconds) {
      // At or after the last trip
      const lastCenter = getRowCenter(trips.length - 1);
      setPointerTop(lastCenter + 15);
      setPointerVisible(true);
      return;
    }

    // Find interval between trips
    for (let i = 0; i < trips.length - 1; i++) {
      const t1 = trips[i].departureMinutes * 60;
      const t2 = trips[i + 1].departureMinutes * 60;

      if (currentSeconds >= t1 && currentSeconds <= t2) {
        const fraction = (currentSeconds - t1) / (t2 - t1);
        const y1 = getRowCenter(i);
        const y2 = getRowCenter(i + 1);
        const interpolated = y1 + fraction * (y2 - y1);
        setPointerTop(interpolated);
        setPointerVisible(true);
        return;
      }
    }

    setPointerVisible(true);
  }, [currentTime, trips]);

  // Recalculate whenever time or window size changes
  useEffect(() => {
    updatePointerPosition();

    const handleResize = () => {
      updatePointerPosition();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updatePointerPosition]);

  const currentDayMinutes =
    currentTime.getHours() * 60 + currentTime.getMinutes();

  return (
    <section className="glass-panel timeline-section">
      <div className="timeline-header">
        <div className="timeline-title-group">
          <h2>Daily Departure Schedule</h2>
          <p>Click any timeslot to view boarding and drop-off details.</p>
        </div>

        {hasNoServiceToday && (
          <div
            style={{ fontSize: "0.85rem", color: "#f87171", fontWeight: 600 }}
          >
            * Showing standard weekday timetable for reference
          </div>
        )}
      </div>

      {/* Origin Columns Legend */}
      <div className="timeline-legend">
        <div className="legend-col left">
          <MapPin size={16} />
          <span>From Noble Crystal</span>
          <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>(Block C)</span>
        </div>
        <div className="legend-divider">VS</div>
        <div className="legend-col right">
          <Navigation size={16} />
          <span>From Crescent Campus</span>
          <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>(Canopy)</span>
        </div>
      </div>

      {/* Main Vertical Timeline Container */}
      <div className="timeline-container" ref={containerRef}>
        {/* Central Vertical Spine Line */}
        <div className="timeline-center-line" />

        {/* Dynamic Red Triangle Pointer */}
        <TimelinePointer
          topPx={pointerTop}
          currentTime={currentTime}
          visible={pointerVisible}
          side={effectiveSide}
          onToggleSide={() =>
            setManualSideOverride((prev) =>
              (prev ?? dynamicSide) === "left" ? "right" : "left",
            )
          }
        />

        {/* Chronological Trip Rows */}
        {trips.map((trip, idx) => {
          const isNext = trip.id === nextTripId;
          const isPast =
            !hasNoServiceToday && trip.departureMinutes <= currentDayMinutes;

          return (
            <TimelineItem
              key={trip.id}
              trip={trip}
              currentTime={currentTime}
              isNext={isNext}
              isPast={isPast}
              hasNoServiceToday={hasNoServiceToday}
              onSelect={onSelectTrip}
              rowRef={(el) => {
                rowRefs.current[idx] = el;
              }}
            />
          );
        })}
      </div>
    </section>
  );
};
