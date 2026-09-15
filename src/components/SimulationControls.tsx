import React, { useState } from 'react';
import { Sliders, RotateCcw, X, Sun, Sunset, Moon, Coffee } from 'lucide-react';

interface SimulationControlsProps {
  isSimulated: boolean;
  onSetTime: (date: Date) => void;
  onReset: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isSimulated,
  onSetTime,
  onReset,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const setTimePreset = (hours: number, minutes: number, isWeekend: boolean = false) => {
    const d = new Date();
    // If weekend is requested, set day to Saturday (day 6)
    if (isWeekend) {
      const currentDay = d.getDay();
      const distanceToSat = (6 - currentDay + 7) % 7 || 7;
      d.setDate(d.getDate() + distanceToSat);
    } else {
      // Ensure it's a weekday (e.g. Wednesday)
      if (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() + (d.getDay() === 0 ? 1 : 2));
      }
    }
    d.setHours(hours, minutes, 0, 0);
    onSetTime(d);
  };

  return (
    <div className="sim-controls-bar">
      {!isOpen ? (
        <button
          className="sim-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Test different times of day or weekend state"
        >
          <Sliders size={15} />
          <span>Simulate Time {isSimulated && '(Active)'}</span>
        </button>
      ) : (
        <div className="sim-panel">
          <div className="sim-panel-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={15} /> Time Travel / Testing Mode
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            Jump to any schedule scenario to test the countdown, pointer, and status indicators:
          </p>

          <div className="sim-quick-presets">
            <button
              className="preset-btn"
              onClick={() => setTimePreset(7, 15)}
              title="Before first bus (07:15)"
            >
              <Sun size={12} style={{ display: 'inline', marginRight: '4px' }} />
              07:15 (Morning)
            </button>

            <button
              className="preset-btn"
              onClick={() => setTimePreset(11, 15)}
              title="Mid-day (11:15)"
            >
              <Coffee size={12} style={{ display: 'inline', marginRight: '4px' }} />
              11:15 (Midday)
            </button>

            <button
              className="preset-btn"
              onClick={() => setTimePreset(17, 0)}
              title="Rush hour (17:00)"
            >
              <Sunset size={12} style={{ display: 'inline', marginRight: '4px' }} />
              17:00 (Rush)
            </button>

            <button
              className="preset-btn"
              onClick={() => setTimePreset(21, 10)}
              title="Night departure (21:10)"
            >
              <Moon size={12} style={{ display: 'inline', marginRight: '4px' }} />
              21:10 (Night)
            </button>

            <button
              className="preset-btn"
              onClick={() => setTimePreset(22, 30)}
              title="After all departures (22:30)"
            >
              22:30 (Closed)
            </button>

            <button
              className="preset-btn"
              onClick={() => setTimePreset(12, 0, true)}
              title="Saturday (No Bus Day)"
              style={{ color: '#f87171' }}
            >
              Weekend Mode
            </button>
          </div>

          {isSimulated && (
            <button className="reset-sim-btn" onClick={onReset}>
              <RotateCcw size={13} style={{ display: 'inline', marginRight: '5px' }} />
              Reset to Live Real Time
            </button>
          )}
        </div>
      )}
    </div>
  );
};
