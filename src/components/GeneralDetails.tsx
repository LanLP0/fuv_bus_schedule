import React from "react";
import { Info, MapPin, Building, Calendar } from "lucide-react";
import { GENERAL_INFO, ROUTE_METADATA } from "../data/scheduleData";

export const GeneralDetails: React.FC = () => {
  return (
    <footer className="glass-panel general-details-section">
      <div className="general-details-header">
        <Info size={22} color="#60a5fa" />
        <h3>Route & Schedule Information</h3>
      </div>

      <div className="info-cards-grid">
        {/* Route 1: Noble Crystal to Crescent Campus */}
        <div className="info-card">
          <div className="info-card-header noble">
            <MapPin size={18} />
            <h4>Noble Crystal to Crescent Campus</h4>
          </div>
          <ul>
            <li>
              <strong>Pick-up Point:</strong>{" "}
              {ROUTE_METADATA["Noble Crystal"].pickupPoint}
            </li>
            <li>
              <strong>Operating Hours:</strong>{" "}
              {ROUTE_METADATA["Noble Crystal"].operatingHours} (11 trips daily)
            </li>
            <li>
              <strong>Drop-off Point:</strong> Crescent Plaza Canopy
            </li>
            <li>
              <strong>Estimated Transit:</strong>{" "}
              {GENERAL_INFO.estimatedTransit}
            </li>
          </ul>
        </div>

        {/* Route 2: Crescent Campus to Noble Crystal */}
        <div className="info-card">
          <div className="info-card-header crescent">
            <Building size={18} />
            <h4>Crescent Campus to Noble Crystal</h4>
          </div>
          <ul>
            <li>
              <strong>Pick-up Point:</strong>{" "}
              {ROUTE_METADATA["Crescent Campus"].pickupPoint}
            </li>
            <li>
              <strong>Operating Hours:</strong>{" "}
              {ROUTE_METADATA["Crescent Campus"].operatingHours} (11 trips
              daily)
            </li>
            <li>
              <strong>Drop-off Point:</strong> In front of Block C
            </li>
            <li>
              <strong>Estimated Transit:</strong>{" "}
              {GENERAL_INFO.estimatedTransit}
            </li>
          </ul>
        </div>

        {/* Operational Guidelines & Metadata */}
        <div className="info-card">
          <div className="info-card-header meta">
            <Calendar size={18} />
            <h4>Service Guidelines</h4>
          </div>
          <ul>
            <li>
              <strong>Organization:</strong> {GENERAL_INFO.organization}
            </li>
            <li>
              <strong>Document:</strong> {GENERAL_INFO.document}
            </li>
            <li>
              <strong>Effective Date:</strong> {GENERAL_INFO.effectiveDate}
            </li>
            <li>
              <strong>Operation Days:</strong> {GENERAL_INFO.operatingDays}
            </li>
            <li style={{ color: "#f87171" }}>{GENERAL_INFO.weekendPolicy}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
