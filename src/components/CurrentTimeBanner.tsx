import React from "react";
import { Clock, AlertTriangle, ArrowRight, Compass, Timer } from "lucide-react";
import type { BusTrip } from "../types/schedule";
import {
  formatClockTime,
  formatReadableDate,
  calculateCountdown,
} from "../utils/timeUtils";

interface CurrentTimeBannerProps {
  currentTime: Date;
  nextTrip: BusTrip | null;
  isServiceEnded: boolean;
  hasNoServiceToday: boolean;
  onSelectTrip: (trip: BusTrip) => void;
}

export const CurrentTimeBanner: React.FC<CurrentTimeBannerProps> = ({
  currentTime,
  nextTrip,
  isServiceEnded,
  hasNoServiceToday,
  onSelectTrip,
}) => {
  const clockTime = formatClockTime(currentTime);
  const formattedDate = formatReadableDate(currentTime);

  const countdown = nextTrip
    ? calculateCountdown(nextTrip.departureMinutes, currentTime)
    : null;

  return (
    <section className="glass-panel countdown-banner">
      {/* Live Digital Clock */}
      <div className="clock-display">
        <div className="banner-ambient" />
        <div className="clock-date">
          <Clock size={16} />
          <span>{formattedDate}</span>
        </div>
        <div className="clock-time">{clockTime}</div>
      </div>

      {/* Case 1: Weekend or Holiday (No bus on the day) */}
      {hasNoServiceToday && (
        <div className="no-service-box">
          <div className="no-service-title">
            <AlertTriangle size={22} />
            <span>No Bus Service Today</span>
          </div>
          <p
            style={{
              fontSize: "0.925rem",
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            Fulbright shuttle buses only operate on{" "}
            <strong>weekdays (Monday to Friday)</strong>. There are no shuttle
            departures scheduled on weekends or public holidays.
          </p>
        </div>
      )}

      {/* Case 2: Weekday and Upcoming Next Bus */}
      {!hasNoServiceToday && nextTrip && countdown && (
        <div
          className="next-bus-callout"
          style={{ cursor: "pointer" }}
          onClick={() => onSelectTrip(nextTrip)}
          title="Click to view full pickup & drop-off details"
        >
          <div className="next-bus-label">
            <Timer size={16} />
            <span>Time Left to Next Bus</span>
          </div>

          {/* Red text showing time left to the next bus */}
          <div className="next-bus-countdown-text">{countdown.formatted}</div>

          <div className="next-bus-details-tag">
            <span
              className={`route-pill ${
                nextTrip.origin === "Noble Crystal" ? "noble" : "crescent"
              }`}
            >
              From {nextTrip.origin}
            </span>
            <ArrowRight size={14} color="#9ca3af" />
            <span style={{ color: "#ffffff", fontWeight: 600 }}>
              Departure at {nextTrip.departureTime}
            </span>
            <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
              ({nextTrip.pickupLocation})
            </span>
          </div>
        </div>
      )}

      {/* Case 3: Weekday and all departures completed */}
      {!hasNoServiceToday && isServiceEnded && (
        <div
          className="no-service-box"
          style={{
            borderColor: "rgba(245, 158, 11, 0.4)",
            background: "rgba(245, 158, 11, 0.08)",
          }}
        >
          <div className="no-service-title" style={{ color: "#fbbf24" }}>
            <Compass size={22} />
            <span>Service Concluded For Today</span>
          </div>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#d1d5db",
              textAlign: "center",
            }}
          >
            All 22 scheduled shuttle departures for today have completed.
            Service resumes tomorrow at{" "}
            <strong style={{ color: "#ffffff" }}>07:30</strong> from Noble
            Crystal.
          </p>
        </div>
      )}
    </section>
  );
};
