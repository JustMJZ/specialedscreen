import React, { useState, useEffect, useRef } from 'react';

const DraggableBox = ({ box, onUpdate, isEditMode, containerRef, onEdit, students }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const minDim = Math.min(box.width, box.height);
  const scale = Math.max(0.5, Math.min(1, minDim / 50));
  const assignedStudents = (box.assignedStudents || []).map(id => (students || []).find(s => s.id === id)).filter(Boolean);
  const avatarScale = Math.max(0.5, Math.min(1.5, minDim / 70));
  const avatarSize = Math.max(16, 36 * avatarScale);
  const avatarGap = Math.max(4, 6 * avatarScale);

  useEffect(() => {
    if (!isDragging && !isResizing) return;
    const handleMove = (x, y) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (isDragging) onUpdate({ ...box, left: Math.max(5, Math.min(x - rect.left - dragOffset.x, rect.width - box.width - 5)), top: Math.max(5, Math.min(y - rect.top - dragOffset.y, rect.height - box.height - 5)) });
      if (isResizing) onUpdate({ ...box, width: Math.max(30, Math.min(x - rect.left - box.left, rect.width - box.left - 5)), height: Math.max(30, Math.min(y - rect.top - box.top, rect.height - box.top - 5)) });
    };
    const onMM = (e) => handleMove(e.clientX, e.clientY);
    const onTM = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onEnd = () => { setIsDragging(false); setIsResizing(false); };
    document.addEventListener('mousemove', onMM); document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onTM); document.addEventListener('touchend', onEnd);
    return () => { document.removeEventListener('mousemove', onMM); document.removeEventListener('mouseup', onEnd); document.removeEventListener('touchmove', onTM); document.removeEventListener('touchend', onEnd); };
  }, [isDragging, isResizing, dragOffset, box, onUpdate, containerRef]);

  const colors = ['#FF8A7A', '#5BC0BE', '#7BC47F', '#FFD166', '#B39DDB'];

  return (
    <div ref={ref} className={`absolute rounded flex flex-col items-center justify-center shadow-lg select-none overflow-hidden ${isEditMode ? 'cursor-move' : ''}`}
      style={{ top: box.top, left: box.left, width: box.width, height: box.height, backgroundColor: box.color, zIndex: isDragging || isResizing ? 100 : 4 }}
      onMouseDown={(e) => { if (!isEditMode || e.target.dataset.resize || e.target.dataset.edit) return; e.preventDefault(); const r = ref.current.getBoundingClientRect(); setDragOffset({ x: e.clientX - r.left, y: e.clientY - r.top }); setIsDragging(true); }}
      onTouchStart={(e) => { if (!isEditMode || e.target.dataset.resize || e.target.dataset.edit) return; const t = e.touches[0]; const r = ref.current.getBoundingClientRect(); setDragOffset({ x: t.clientX - r.left, y: t.clientY - r.top }); setIsDragging(true); }}>
      {box.icon && <div style={{ fontSize: Math.max(18, 36 * scale) }}>{box.icon}</div>}
      <div className="text-white font-bold truncate px-1 text-center w-full" style={{ fontSize: Math.max(10, 18 * scale) }}>{box.label}</div>
      {assignedStudents.length > 0 && !box.hideStudents && (
        <div className="flex flex-wrap justify-center px-0.5 mt-0.5" style={{ gap: avatarGap }}>
          {assignedStudents.map(s => (
            <div key={s.id} className="flex flex-col items-center" style={{ gap: 1 }}>
              {s.photo ? (
                <img src={s.photo} alt={s.name} className="rounded-full object-cover border-2 border-white/60"
                  style={{ width: avatarSize, height: avatarSize }} />
              ) : s.emoji ? (
                <div className="rounded-full flex items-center justify-center border-2 border-white/60"
                  style={{ width: avatarSize, height: avatarSize, fontSize: avatarSize * 0.75, backgroundColor: colors[s.name.charCodeAt(0) % 5] }}>{s.emoji}</div>
              ) : (
                <div className="rounded-full flex items-center justify-center text-white font-bold border-2 border-white/60"
                  style={{ width: avatarSize, height: avatarSize, fontSize: avatarSize * 0.4, backgroundColor: colors[s.name.charCodeAt(0) % 5] }}>
                  {s.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
              <span className="text-white font-medium whitespace-nowrap text-center" style={{ fontSize: Math.max(6, avatarSize * 0.35), lineHeight: 1 }}>{s.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      )}
      {assignedStudents.length > 0 && (
        <button data-edit="true" onClick={(e) => { e.stopPropagation(); onUpdate({ ...box, hideStudents: !box.hideStudents }); }}
          className="absolute bottom-0.5 right-0.5 rounded-full flex items-center justify-center shadow"
          style={{ width: 14, height: 14, fontSize: 8, backgroundColor: 'rgba(0,0,0,0.35)', color: 'white', zIndex: 10, lineHeight: 1 }}
          title={box.hideStudents ? 'Show students' : 'Hide students'}>
          {box.hideStudents ? '👁' : '👁‍🗨'}
        </button>
      )}
      {isEditMode && <>
        <button data-edit="true" onClick={(e) => { e.stopPropagation(); onEdit(box); }} className="absolute top-0.5 left-0.5 w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center shadow" style={{ zIndex: 10 }}>✏️</button>
        <div data-resize="true" className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.5) 50%)' }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsResizing(true); }} onTouchStart={(e) => { e.stopPropagation(); setIsResizing(true); }} />
      </>}
    </div>
  );
};

export default DraggableBox;
