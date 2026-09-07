import React, { useEffect, useRef, useState } from 'react';
import { useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { loadingStore } from '../../services/loadingStore';

const TopProgressBar: React.FC = () => {
  const apiActive = useSyncExternalStore(
    loadingStore.subscribe,
    () => loadingStore.active
  );

  const location = useLocation();
  const prevPath = useRef('');
  const [routePending, setRoutePending] = useState(false);

  useEffect(() => {
    const path = location.pathname + location.search;
    if (path !== prevPath.current) {
      prevPath.current = path;
      setRoutePending(true);
      const t = window.setTimeout(() => setRoutePending(false), 250);
      return () => window.clearTimeout(t);
    }
  }, [location]);

  const busy = apiActive || routePending;

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const showTimer = window.setTimeout(() => {
      if (busy) {
        setVisible(true);
        setProgress((p) => (p > 0 && p < 8 ? p : 0));
      } else {
        setProgress(100);
        timerRef.current = window.setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 350);
      }
    }, 0);
    return () => {
      window.clearTimeout(showTimer);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [busy]);

  useEffect(() => {
    if (!busy) return;
    const tick = () => {
      setProgress((p) => {
        if (p >= 92) return p;
        return Math.min(92, p + Math.max(1, (92 - p) * 0.06));
      });
    };
    const interval = window.setInterval(tick, 180);
    return () => window.clearInterval(interval);
  }, [busy]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none">
      <div
        className="h-full rounded-r-full transition-[width] duration-300 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #60A5FA, #2563EB, #1D4ED8)',
          boxShadow: '0 0 8px rgba(37,99,235,0.6)',
        }}
      />
    </div>
  );
};

export default TopProgressBar;
