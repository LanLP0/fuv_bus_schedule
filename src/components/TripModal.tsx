import React, { useEffect } from 'react';
import { X, MapPin, Navigation, Clock, ShieldCheck, Bus } from 'lucide-react';
import type { BusTrip } from '../types/schedule';
import { ROUTE_METADATA } from '../data/scheduleData';

interface TripModalProps {
  trip: BusTrip | null;
  onClose: () => void;
}

export const TripModal: React.FC<TripModalProps> = ({ trip, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (trip) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [trip, onClose]);

  if (!trip) return null;

  const originMeta = ROUTE_METADATA[trip.origin];

  // Calculate estimated arrival time
  const arrivalMinutes = trip.departureMinutes + trip.estimatedDurationMinutes;
  const arrHours = Math.floor(arrivalMinutes / 60);
  const arrMins = arrivalMinutes % 60;
  const arrivalTimeStr = `${arrHours.toString().padStart(2, '0')}:${arrMins
    .toString()
    .padStart(2, '0')}`;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: originMeta.badgeBg,
                color: originMeta.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${originMeta.borderColor}`,
              }}
            >
              <Bus size={22} />
            </div>
            <div>
              <h3 className="modal-title">Trip Departure Details</h3>
              <p style={{ fontSize: '0.825rem', color: '#9ca3af' }}>
                Route: {trip.origin} → {trip.destination}
              </p>
            </div>
          </div>
          <button
            className="modal-close-icon"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close popup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Timeline Details */}
        <div className="modal-timeline-detail">
          {/* Pickup Step */}
          <div className="detail-point">
            <div
              className="detail-icon-box"
              style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}
            >
              <MapPin size={18} />
            </div>
            <div className="detail-text">
              <h4>Pickup Location</h4>
              <p>{trip.pickupLocation}</p>
              <small>Scheduled Departure: <strong>{trip.departureTime}</strong></small>
            </div>
          </div>

          {/* Transit Connector */}
          <div className="transit-connector">
            <Clock size={13} style={{ marginRight: '6px' }} />
            <span>Approx. {trip.estimatedDurationMinutes} mins transit window</span>
          </div>

          {/* Drop-off Step */}
          <div className="detail-point">
            <div
              className="detail-icon-box"
              style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}
            >
              <Navigation size={18} />
            </div>
            <div className="detail-text">
              <h4>Drop-off Location</h4>
              <p>{trip.dropoffLocation}</p>
              <small>Estimated Arrival: <strong>~{arrivalTimeStr}</strong></small>
            </div>
          </div>
        </div>

        {/* Operational Note */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '0.825rem',
            color: '#9ca3af',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <ShieldCheck size={18} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            {trip.notes || 'Please be at the pickup station 5 minutes before scheduled departure.'}
          </span>
        </div>

        {/* Modal Actions */}
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
