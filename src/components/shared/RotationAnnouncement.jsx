import React from 'react';

const RotationAnnouncement = ({ show, phase }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none" style={{ opacity: show ? 1 : 0, transition: 'opacity 1s ease' }}>
    <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-8 py-4 rounded-2xl shadow-2xl" style={{ transform: show ? 'scale(1)' : 'scale(0.9)', transition: 'transform 0.8s ease' }}>
      <div className="text-2xl font-bold text-center">{phase === 'moving' ? '🚶 Moving to next station... 🚶' : '🔄 Rotation Time! 🔄'}</div>
      <div className="text-center mt-1 text-white/90">{phase === 'moving' ? 'Walk calmly to your next group' : 'Time to switch stations'}</div>
    </div>
  </div>
);

export default RotationAnnouncement;
