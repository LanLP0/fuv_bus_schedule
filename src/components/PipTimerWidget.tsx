import React from "react";
import { Bus, Clock, X, ArrowRight, MapPin } from "lucide-react";
import type { BusTrip } from "../types/schedule";
import { formatClockTime } from "../utils/timeUtils";

interface PipTimerWidgetProps {
  currentTime: Date;
  nextTrip: BusTrip | null;
  countdownText: string;
  isBoarding: boolean;
  onClose: () => void;
}

export const PipTimerWidget: React.FC<PipTimerWidgetProps> = ({
  currentTime,
  nextTrip,
  countdownText,
  isBoarding,
  onClose,
}) => {
  const isNoble = nextTrip?.origin === "Noble Crystal";

  return (
    <div className="pip-widget-container">
      {/* Top Header: Brand + Clock + Close Button */}
      <div className="pip-header">
        <div className="pip-brand">
          <div className="pip-icon-box">
            <Bus size={15} />
          </div>
          <span className="pip-brand-title">FUV Shuttle</span>
        </div>

        <div className="pip-clock">
          <Clock size={12} />
          <span>{formatClockTime(currentTime)}</span>
        </div>

        <button
          className="pip-close-btn"
          onClick={onClose}
          title="Exit Picture-in-Picture"
          aria-label="Exit Picture-in-Picture"
        >
          <X size={14} />
        </button>
      </div>

      {/* Main Countdown Display */}
      <div className="pip-body">
        <div className="pip-label">TIME TO NEXT BUS</div>

        <div className={`pip-countdown ${isBoarding ? "is-boarding" : ""}`}>
          {countdownText}
        </div>

        {nextTrip ? (
          <div className="pip-details">
            <div className="pip-route-tag">
              <span
                className={`pip-origin-pill ${isNoble ? "noble" : "crescent"}`}
              >
                From {nextTrip.origin}
              </span>
              <ArrowRight size={11} color="#9ca3af" />
              <span className="pip-departure-time">
                {nextTrip.departureTime}
              </span>
            </div>

            <div className="pip-pickup">
              <MapPin size={11} />
              <span>{nextTrip.pickupLocation}</span>
            </div>
          </div>
        ) : (
          <div className="pip-no-bus">No more scheduled buses today</div>
        )}
      </div>
    </div>
  );
};
