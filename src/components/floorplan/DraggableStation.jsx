import React, { useState, useEffect, useRef } from 'react';
import { COLORS } from '../../constants';

const DraggableStation = ({ color, config, onUpdate, isEditMode, isTarget, containerRef, students, teacherName, stationColors, onRemove }) => {
  const station = stationColors[color] || COLORS.stations[color] || { bg: '#9CA3AF', light: '#E5E7EB' };
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const minDim = Math.min(config.width, config.height);
  const scale = Math.max(0.3, Math.min(1.2, minDim / 80));

  const teacherFontSize = Math.max(8, Math.floor(14.4 * scale));
  const studentFontSize = Math.max(5, Math.floor(9 * scale));
  const dotSize = Math.max(5, Math.floor(9.6 * scale));
  const padding = Math.max(2, Math.floor(4 * scale));

  const stationStudents = students.filter(s => s.group === color);

  useEffect(() => {
    if (!isDragging && !isResizing) return;
    const handleMove = (x, y) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (isDragging) onUpdate(color, { ...config, left: Math.max(5, Math.min(x - rect.left - dragOffset.x, rect.width - config.width - 5)), top: Math.max(5, Math.min(y - rect.top - dragOffset.y, rect.height - config.height - 5)) });
      if (isResizing) onUpdate(color, { ...config, width: Math.max(50, Math.min(x - rect.left - config.left, rect.width - config.left - 5)), height: Math.max(40, Math.min(y - rect.top - config.top, rect.height - config.top - 5)) });
    };
    const onMM = (e) => handleMove(e.clientX, e.clientY);
    const onTM = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onEnd = () => { setIsDragging(false); setIsResizing(false); };
    document.addEventListener('mousemove', onMM); document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onTM); document.addEventListener('touchend', onEnd);
    return () => { document.removeEventListener('mousemove', onMM); document.removeEventListener('mouseup', onEnd); document.removeEventListener('touchmove', onTM); document.removeEventListener('touchend', onEnd); };
  }, [isDragging, isResizing, dragOffset, color, config, onUpdate, containerRef]);

  return (
    <div ref={ref} className={`absolute rounded-lg shadow-md select-none overflow-hidden ${isEditMode ? 'cursor-move' : ''}`}
      style={{ top: config.top, left: config.left, width: config.width, height: config.height, backgroundColor: station.light, border: `2px solid ${station.bg}`,
        boxShadow: isTarget ? `0 0 12px ${station.bg}50` : '0 2px 6px rgba(0,0,0,0.1)', zIndex: isDragging || isResizing ? 100 : 5 }}
      onMouseDown={(e) => { if (!isEditMode || e.target.dataset.resize) return; e.preventDefault(); const r = ref.current.getBoundingClientRect(); setDragOffset({ x: e.clientX - r.left, y: e.clientY - r.top }); setIsDragging(true); }}
      onTouchStart={(e) => { if (!isEditMode || e.target.dataset.resize) return; const t = e.touches[0]; const r = ref.current.getBoundingClientRect(); setDragOffset({ x: t.clientX - r.left, y: t.clientY - r.top }); setIsDragging(true); }}>

      <div className="flex items-center overflow-hidden" style={{ padding, gap: padding }}>
        <div className="rounded-full flex-shrink-0" style={{ backgroundColor: station.bg, width: dotSize, height: dotSize }} />
        <span className="font-bold text-gray-700 truncate" style={{ fontSize: teacherFontSize, lineHeight: 1.1 }}>{teacherName}</span>
      </div>

      {!isEditMode && stationStudents.length > 0 && (
        <div className="overflow-hidden" style={{ paddingLeft: padding, paddingRight: padding }}>
          <div className="text-gray-500 truncate" style={{ fontSize: studentFontSize, lineHeight: 1.2 }}>
            {stationStudents.map(s => s.name.split(' ')[0]).join(', ')}
          </div>
        </div>
      )}

      {isEditMode && <>
        <div data-resize="true" className="absolute bottom-0 right-0 cursor-se-resize flex items-end justify-end" style={{ width: 16, height: 16, zIndex: 10 }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsResizing(true); }} onTouchStart={(e) => { e.stopPropagation(); setIsResizing(true); }}>
          <svg width="10" height="10" viewBox="0 0 10 10" style={{ margin: 1, opacity: 0.7 }}>
            <line x1="9" y1="1" x2="1" y2="9" stroke={station.bg} strokeWidth="1.5" />
            <line x1="9" y1="4.5" x2="4.5" y2="9" stroke={station.bg} strokeWidth="1.5" />
            <line x1="9" y1="8" x2="8" y2="9" stroke={station.bg} strokeWidth="1.5" />
          </svg>
        </div>
        {onRemove && <button data-resize="true" onClick={(e) => { e.stopPropagation(); onRemove(color); }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center shadow hover:bg-red-600" style={{ fontSize: 9, lineHeight: 1, zIndex: 10 }}>✕</button>}
        <div data-resize="true" className="absolute bottom-0 left-0 flex items-center gap-0.5" style={{ padding: 2, zIndex: 10 }}
          onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
          <button data-resize="true" onClick={() => { const s = Math.max(0.3, Math.round(((config.avatarScale || 1.0) - 0.1) * 10) / 10); onUpdate(color, { ...config, avatarScale: s }); }}
            className="flex items-center justify-center rounded text-white font-bold" style={{ width: 14, height: 14, fontSize: 10, lineHeight: 1, backgroundColor: station.bg, opacity: 0.85 }}>−</button>
          <span className="text-gray-600 font-mono" style={{ fontSize: 8, lineHeight: 1 }}>{(config.avatarScale || 1.0).toFixed(1)}x</span>
          <button data-resize="true" onClick={() => { const s = Math.min(2.0, Math.round(((config.avatarScale || 1.0) + 0.1) * 10) / 10); onUpdate(color, { ...config, avatarScale: s }); }}
            className="flex items-center justify-center rounded text-white font-bold" style={{ width: 14, height: 14, fontSize: 10, lineHeight: 1, backgroundColor: station.bg, opacity: 0.85 }}>+</button>
        </div>
      </>}
    </div>
  );
};

export default DraggableStation;
