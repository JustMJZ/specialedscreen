import React from 'react';
import { COLORS } from '../../constants';

const StationGroups = ({ students, isAnimating, animationTargets, teacherNames, stationColors, rotationOrder }) => (
  <div className="bg-white rounded-lg p-2.5 shadow-md">
    <div className="text-sm font-bold text-gray-500 mb-1.5">GROUPS</div>
    <div className="grid grid-cols-1 gap-1">
      {rotationOrder.map(color => {
        const s = stationColors[color] || COLORS.stations[color] || { bg: '#9CA3AF', light: '#E5E7EB' };
        const name = teacherNames[color] || color;
        const grp = students.filter(st => st.group === color);
        const isTarget = isAnimating && Object.values(animationTargets).includes(color);
        return (
          <div key={color} className="flex items-center gap-1.5 px-2 py-1.5 rounded"
            style={{ backgroundColor: s.light, border: `1px solid ${s.bg}`, opacity: isAnimating && !isTarget ? 0.5 : 1 }}>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.bg }} />
            <span className="font-bold text-gray-700 text-sm">{name.split(' ')[1] || name}</span>
            <span className="text-gray-500 truncate flex-1 text-sm">: {grp.map(st => st.name.split(' ')[0]).join(', ')}</span>
          </div>
        );
      })}
    </div>
  </div>
);

export default StationGroups;
