import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import type { BusTrip } from '../types/schedule';
import { getTripRemainingTime } from '../utils/timeUtils';

interface TimelineItemProps {
  trip: BusTrip;
  currentTime: Date;
  isNext: boolean;
  isPast: boolean;
  hasNoServiceToday: boolean;
  onSelect: (trip: BusTrip) => void;
  rowRef: (el: HTMLDivElement | null) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  trip,
  currentTime,
  isNext,
  isPast,
  hasNoServiceToday,
  onSelect,
  rowRef,
}) => {
  const isNoble = trip.origin === 'Noble Crystal';
  const remaining = getTripRemainingTime(trip.departureMinutes, currentTime, hasNoServiceToday);

  const cardElement = (
    <div
      className={`departure-card ${isNoble ? 'noble' : 'crescent'} ${
        isNext ? 'is-next' : ''
      } ${isPast ? 'is-past' : ''}`}
      onClick={() => onSelect(trip)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(trip);
        }
      }}
      title="Click to view trip pickup & drop-off details"
    >
      <div className="card-top">
        <div className="card-time-group">
          <span className="departure-time-text">{trip.departureTime}</span>
          {remaining.text && (
            <span
              className={`card-remaining-tag ${
                isNext
                  ? 'is-active'
                  : isPast
                  ? 'is-past'
                  : 'is-upcoming'
              }`}
            >
              {remaining.isBoarding
                ? 'Now boarding'
                : isPast
                ? remaining.text
                : `in ${remaining.text}`}
            </span>
          )}
        </div>
        {isNext && <span className="next-pill">Next Bus</span>}
      </div>

      <div className="card-route">
        <span
          style={{
            color: isNoble ? '#60a5fa' : '#34d399',
            fontWeight: 600,
          }}
        >
          From {trip.origin}
        </span>
      </div>

      <div className="card-pickup-snippet">
        <MapPin size={12} />
        <span>{trip.pickupLocation}</span>
      </div>

      <div className="card-cta">
        <span>View pickup details</span>
        <ChevronRight size={12} />
      </div>
    </div>
  );

  return (
    <div
      ref={rowRef}
      className={`timeline-row ${isNoble ? 'noble' : 'crescent'} ${
        isNext ? 'is-next' : ''
      } ${isPast ? 'is-past' : ''}`}
      data-trip-id={trip.id}
    >
      {/* Left Column: Noble Crystal */}
      <div className="timeline-side-content left">
        {isNoble ? cardElement : <div className="timeline-empty-side" />}
      </div>

      {/* Center Line Node */}
      <div className="timeline-node-slot">
        <div className="timeline-dot" />
      </div>

      {/* Right Column: Crescent Campus */}
      <div className="timeline-side-content right">
        {!isNoble ? cardElement : <div className="timeline-empty-side" />}
      </div>
    </div>
  );
};
