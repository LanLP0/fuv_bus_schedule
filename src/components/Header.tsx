import React from "react";
import { Bus, Calendar, Clock } from "lucide-react";

interface HeaderProps {
  isWeekday: boolean;
  isSimulated: boolean;
  dateStr: string;
}

export const Header: React.FC<HeaderProps> = ({
  isWeekday,
  isSimulated,
  dateStr,
}) => {
  return (
    <header className="glass-panel header-wrapper">
      <div className="brand-section">
        <div className="brand-icon-box">
          <Bus size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="brand-title">FUV Shuttle Bus</h1>
          <div className="brand-subtitle">
            <span>Noble Crystal</span>
            <span>⇄</span>
            <span>Crescent Campus</span>
            <span className="date">•</span>
            <span
              className="date"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Calendar size={13} /> {dateStr}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {isSimulated && (
          <div className="status-pill simulated">
            <Clock size={14} />
            <span>Simulated Time</span>
          </div>
        )}

        <div className={`status-pill ${isWeekday ? "active" : "weekend"}`}>
          <span className="status-dot"></span>
          <span>
            {isWeekday ? "Weekday Service Active" : "Weekend (No Service)"}
          </span>
        </div>
      </div>
    </header>
  );
};
