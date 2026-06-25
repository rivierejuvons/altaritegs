import { useEffect, useState } from 'react';

export function useWakeLock() {
  const [isSupported] = useState('wakeLock' in navigator);

  useEffect(() => {
    if (!isSupported) return;

    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Screen Wake Lock is active');
      } catch (err: any) {
        console.warn(`Wake Lock error: ${err.name}, ${err.message}`);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release().then(() => {
          console.log('Screen Wake Lock released');
        });
      }
    };
  }, [isSupported]);
}
