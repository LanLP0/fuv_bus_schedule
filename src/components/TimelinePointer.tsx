import React from 'react';
import { formatClockTime } from '../utils/timeUtils';

interface TimelinePointerProps {
  topPx: number;
  currentTime: Date;
  visible: boolean;
  side: 'left' | 'right';
  onToggleSide?: () => void;
}

export const TimelinePointer: React.FC<TimelinePointerProps> = ({
  topPx,
  currentTime,
  visible,
  side,
  onToggleSide,
}) => {
  if (!visible) return null;

  return (
    <div
      className={`timeline-pointer-wrapper side-${side}`}
      style={{
        top: `${topPx}px`,
      }}
      onClick={onToggleSide}
      title="Dynamic time pointer (click to flip side)"
      aria-label={`Current time indicator: ${formatClockTime(currentTime)} on ${side} side`}
    >
      {/* Pulsing center red node directly on the central line */}
      <div className="pointer-center-node" />

      {/* Red triangle pointer pointing at the central line from active side */}
      <div className="pointer-triangle" />

      {/* Red text pill badge showing current time */}
      <div className="pointer-badge">
        <span>NOW</span>
        <span>•</span>
        <span>{formatClockTime(currentTime)}</span>
      </div>
    </div>
  );
};
