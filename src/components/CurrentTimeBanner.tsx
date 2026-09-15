import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Clock,
  AlertTriangle,
  ArrowRight,
  Compass,
  Timer,
  PictureInPicture2,
} from "lucide-react";
import type { BusTrip } from "../types/schedule";
import {
  formatClockTime,
  formatReadableDate,
  calculateCountdown,
} from "../utils/timeUtils";
import { usePictureInPicture } from "../hooks/usePictureInPicture";
import { PipTimerWidget } from "./PipTimerWidget";

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

  const {
    isPipActive,
    pipMode,
    pipWindow,
    isSupported: isPipSupported,
    togglePip,
    closePip,
    canvasRef,
    videoRef,
  } = usePictureInPicture();

  // Canvas drawing for video PiP fallback when active
  useEffect(() => {
    if (pipMode !== "video" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dark sleek background
    ctx.fillStyle = "#0a0e17";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Red accent indicator line
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(0, 0, 4, canvas.height);

    // Brand & Clock
    ctx.fillStyle = "#9ca3af";
    ctx.font = "bold 13px Inter, sans-serif";
    ctx.fillText("FUV Shuttle", 20, 30);
    ctx.font = "13px JetBrains Mono, monospace";
    ctx.fillText(clockTime, canvas.width - 85, 30);

    // Label
    ctx.fillStyle = "#f87171";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillText("TIME LEFT TO NEXT BUS", 20, 64);

    // Countdown Text
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 38px JetBrains Mono, monospace";
    ctx.fillText(countdown?.formatted || "Now boarding", 20, 110);

    // Route info
    if (nextTrip) {
      ctx.fillStyle = nextTrip.origin === "Noble Crystal" ? "#60a5fa" : "#34d399";
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.fillText(`From ${nextTrip.origin} • ${nextTrip.departureTime}`, 20, 148);

      ctx.fillStyle = "#6b7280";
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText(nextTrip.pickupLocation, 20, 172);
    }
  }, [pipMode, currentTime, clockTime, countdown, nextTrip, canvasRef]);

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
          <div className="next-bus-header-row">
            <div className="next-bus-label">
              <Timer size={16} />
              <span>Time Left to Next Bus</span>
            </div>

            {isPipSupported && (
              <button
                className={`pip-toggle-btn ${isPipActive ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePip();
                }}
                title={
                  isPipActive
                    ? "Close Picture-in-Picture"
                    : "Pop out timer (Picture-in-Picture)"
                }
                aria-label="Toggle Picture-in-Picture mode"
              >
                <PictureInPicture2 size={15} />
                <span>{isPipActive ? "In PiP" : "PiP"}</span>
              </button>
            )}
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

      {/* Offscreen elements for video PiP fallback */}
      <canvas
        ref={canvasRef}
        width={340}
        height={200}
        style={{ display: "none" }}
      />
      <video ref={videoRef} playsInline muted style={{ display: "none" }} />

      {/* Document Picture-in-Picture Portal */}
      {pipWindow &&
        createPortal(
          <PipTimerWidget
            currentTime={currentTime}
            nextTrip={nextTrip}
            countdownText={countdown?.formatted || "Now boarding"}
            isBoarding={countdown?.isBoarding || false}
            onClose={closePip}
          />,
          pipWindow.document.body,
        )}
    </section>
  );
};
