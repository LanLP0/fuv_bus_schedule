import { useState, useEffect, useCallback } from 'react';

export function useCurrentTime() {
  const [realTime, setRealTime] = useState<Date>(new Date());
  const [simulatedTime, setSimulatedTimeState] = useState<Date | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  // Live timer tick every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());

      // If simulated, advance simulated time by 1 second as well so clock continues ticking smoothly
      if (isSimulated && simulatedTime) {
        setSimulatedTimeState((prev) => (prev ? new Date(prev.getTime() + 1000) : null));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isSimulated, simulatedTime]);

  const setSimulated = useCallback((date: Date) => {
    setSimulatedTimeState(date);
    setIsSimulated(true);
  }, []);

  const resetToRealTime = useCallback(() => {
    setIsSimulated(false);
    setSimulatedTimeState(null);
    setRealTime(new Date());
  }, []);

  const activeTime = isSimulated && simulatedTime ? simulatedTime : realTime;

  return {
    currentTime: activeTime,
    isSimulated,
    setSimulatedTime: setSimulated,
    resetToRealTime,
  };
}
