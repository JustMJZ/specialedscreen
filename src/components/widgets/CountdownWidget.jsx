import React, { useState, useEffect } from 'react';

const CountdownWidget = ({ event, targetTime, onEdit }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [editing, setEditing] = useState(false);
  const [newEvent, setNewEvent] = useState(event);
  const [newTime, setNewTime] = useState(targetTime);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const [hours, minutes] = targetTime.split(':').map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const diff = target - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m`);
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [targetTime]);

  if (editing) {
    return (
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-2 shadow-md">
        <input value={newEvent} onChange={e => setNewEvent(e.target.value)} placeholder="Event name"
          className="w-full px-2 py-1 rounded text-sm mb-1 border" />
        <div className="flex gap-1">
          <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
            className="flex-1 px-2 py-1 rounded text-sm border" />
          <button onClick={() => { onEdit(newEvent, newTime); setEditing(false); }}
            className="px-2 py-1 bg-purple-500 text-white rounded text-xs">✓</button>
          <button onClick={() => setEditing(false)} className="px-2 py-1 bg-gray-200 rounded text-xs">✕</button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setEditing(true)} className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow">
      <div className="text-xs font-bold text-purple-600">⏰ COUNTDOWN TO</div>
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-700">{event}</span>
        <span className="text-lg font-bold text-purple-600">{timeLeft}</span>
      </div>
    </div>
  );
};

export default CountdownWidget;
