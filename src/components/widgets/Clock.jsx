import React, { useState, useEffect } from 'react';
import { COLORS } from '../../constants';

const Clock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return <div className="rounded-lg px-3 py-1.5 shadow text-xl font-bold h-full" style={{ color: COLORS.text }}>{time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>;
};

export default Clock;
