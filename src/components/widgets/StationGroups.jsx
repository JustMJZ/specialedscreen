import React from 'react';
import { COLORS } from '../../constants';

const StationGroups = ({ students, isAnimating, animationTargets, teacherNames, stationColors, rotationOrder }) => (
  <div className="h-full flex flex-col min-h-0">
    <style>{`
      @keyframes card-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
      }
      @keyframes group-glow {
        0%, 100% { box-shadow: 0 0 0 rgba(56,189,248,0); transform: translateY(0); }
        50% { box-shadow: 0 0 14px rgba(56,189,248,0.35); transform: translateY(-1px); }
      }
      @keyframes shimmer-sweep {
        0% { transform: translateX(-120%); opacity: 0; }
        30% { opacity: 0.3; }
        100% { transform: translateX(120%); opacity: 0; }
      }
      @keyframes dot-pulse {
        0%, 100% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.25); opacity: 1; }
      }
    `}</style>
    <div className="flex-1 min-h-0 rounded-lg bg-transparent p-2 overflow-hidden">
      <div className="grid grid-cols-1 gap-1.5 h-full min-h-0 overflow-y-auto auto-rows-min relative">
        {rotationOrder.map(color => {
          const s = stationColors[color] || COLORS.stations[color] || { bg: '#9CA3AF', light: '#E5E7EB' };
          const bg = s.bg || '#9CA3AF';
          const light = s.light || s.bg || '#E5E7EB';
          const name = teacherNames[color] || color;
          const grp = students.filter(st => st.group === color);
          const isTarget = isAnimating && Object.values(animationTargets).includes(color);
          return (
            <div key={color} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl relative overflow-hidden"
              style={{
                backgroundColor: light,
                backgroundImage: `linear-gradient(135deg, ${light} 0%, #ffffff 55%, ${light} 100%)`,
                border: `1px solid ${bg}`,
                boxShadow: '0 1px 0 rgba(15,23,42,0.08), 0 6px 12px rgba(15,23,42,0.08)',
                opacity: isAnimating && !isTarget ? 0.5 : 1,
                animation: isTarget ? 'group-glow 1.4s ease-in-out infinite' : 'card-float 4.2s ease-in-out infinite',
              }}>
              <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: bg }} />
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.35) 45%, transparent 70%)',
                animation: 'shimmer-sweep 6s linear infinite',
                mixBlendMode: 'screen',
              }} />
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 grid place-items-center text-sm shadow-sm"
                style={{ backgroundColor: bg, color: '#fff' }}
                title={name}
              >
                {name.trim().charAt(0).toUpperCase()}
              </div>
              <span className="font-black text-gray-700 text-sm">
                {name.split(' ')[1] || name}
              </span>
              <span className="text-gray-500 truncate flex-1 text-sm">
                {grp.length > 0 ? `: ${grp.map(st => st.name.split(' ')[0]).join(', ')}` : ': —'}
              </span>
              <span
                className="text-[10px] font-bold text-gray-700 px-1.5 py-0.5 rounded-full bg-white/80 border shadow-sm"
                style={{ borderColor: bg }}
              >
                {grp.length}
              </span>
              {isTarget && (
                <span
                  className="text-xs"
                  style={{ color: bg, animation: 'dot-pulse 1.1s ease-in-out infinite' }}
                >
                  ●
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default StationGroups;
