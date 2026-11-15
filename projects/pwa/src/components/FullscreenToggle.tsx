import React, { useEffect, useState } from 'react';
import { Button } from './ui';
export function FullscreenToggle() {
  const [active, setActive] = useState(Boolean(document.fullscreenElement)),
    [error, setError] = useState('');
  useEffect(() => {
    const update = () => setActive(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);
  if (!document.fullscreenEnabled) return null;
  async function toggle() {
    try {
      setError('');
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setError('Full screen is unavailable. You can continue in this window.');
    }
  }
  return (
    <div className="fullscreen-control">
      <Button type="button" aria-pressed={active} onClick={() => void toggle()}>
        {active ? 'Exit full screen' : 'Full screen'}
      </Button>
      {error && (
        <span role="status" className="hint">
          {error}
        </span>
      )}
    </div>
  );
}
