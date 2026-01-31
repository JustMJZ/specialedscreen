import React, { useEffect, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import FloorPlanTabs from './FloorPlanTabs';
import DraggableStation from './DraggableStation';
import DraggableBox from './DraggableBox';
import AnimatedStudent from './AnimatedStudent';

const FloorPlan = () => {
  const {
    students, stationConfigs, setStationConfigs, customBoxes, setCustomBoxes,
    teacherNames, allStationColors, tabStationKeys,
    isEditMode, floorPlanRef, isAnimating, animationTargets,
    setEditingBox, setSelectedStudentId, removeStationFromTab
  } = useAppState();

  // Track previous container size to detect actual resizes (not initial mount)
  const prevSizeRef = useRef(null);

  // When the floor plan container resizes, clamp all stations and boxes back into bounds
  useEffect(() => {
    const container = floorPlanRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const cw = entry.contentRect.width;
        const ch = entry.contentRect.height;
        if (cw === 0 || ch === 0) return;

        // Skip the very first observation (initial mount) — only act on actual resizes
        if (!prevSizeRef.current) {
          prevSizeRef.current = { w: cw, h: ch };
          return;
        }
        // Only clamp if size actually changed
        if (prevSizeRef.current.w === cw && prevSizeRef.current.h === ch) return;
        prevSizeRef.current = { w: cw, h: ch };

        const margin = 5;

        // Clamp stations
        setStationConfigs(prev => {
          let changed = false;
          const next = { ...prev };
          for (const key of Object.keys(next)) {
            const s = next[key];
            const clampedW = Math.min(s.width, cw - margin * 2);
            const clampedH = Math.min(s.height, ch - margin * 2);
            const clampedL = Math.min(s.left, cw - clampedW - margin);
            const clampedT = Math.min(s.top, ch - clampedH - margin);
            if (clampedW !== s.width || clampedH !== s.height || clampedL !== s.left || clampedT !== s.top) {
              next[key] = {
                ...s,
                width: Math.max(50, clampedW),
                height: Math.max(40, clampedH),
                left: Math.max(margin, clampedL),
                top: Math.max(margin, clampedT),
              };
              changed = true;
            }
          }
          return changed ? next : prev;
        });

        // Clamp custom boxes
        setCustomBoxes(prev => {
          let changed = false;
          const next = prev.map(b => {
            const clampedW = Math.min(b.width, cw - margin * 2);
            const clampedH = Math.min(b.height, ch - margin * 2);
            const clampedL = Math.min(b.left, cw - clampedW - margin);
            const clampedT = Math.min(b.top, ch - clampedH - margin);
            if (clampedW !== b.width || clampedH !== b.height || clampedL !== b.left || clampedT !== b.top) {
              changed = true;
              return {
                ...b,
                width: Math.max(30, clampedW),
                height: Math.max(30, clampedH),
                left: Math.max(margin, clampedL),
                top: Math.max(margin, clampedT),
              };
            }
            return b;
          });
          return changed ? next : prev;
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [floorPlanRef, setStationConfigs, setCustomBoxes]);

  return (
    <div className="flex flex-col gap-0 h-full">
      <FloorPlanTabs />
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-lg p-2 flex-1 flex flex-col min-h-0">
        <div ref={floorPlanRef} className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden"
          style={{ border: isEditMode ? '2px dashed #3B82F6' : '2px solid #e5e7eb' }}>
          <div className="absolute inset-2 border-2 border-gray-300 rounded bg-gray-50/50" />
          {tabStationKeys.map(c => <DraggableStation key={c} color={c} config={stationConfigs[c]} onUpdate={(col, cfg) => setStationConfigs(p => ({ ...p, [col]: cfg }))} isEditMode={isEditMode} isTarget={isAnimating && Object.values(animationTargets).includes(c)} containerRef={floorPlanRef} students={students} teacherName={teacherNames[c] || c} stationColors={allStationColors} onRemove={removeStationFromTab} />)}
          {customBoxes.map(b => <DraggableBox key={b.id} box={b} onUpdate={(ub) => setCustomBoxes(p => p.map(x => x.id === ub.id ? ub : x))} isEditMode={isEditMode} containerRef={floorPlanRef} onEdit={setEditingBox} students={students} />)}
          {students.filter(s => stationConfigs[s.group]).map(s => { const grp = students.filter(x => x.group === s.group && stationConfigs[x.group]); return <AnimatedStudent key={s.id} name={s.name} photo={s.photo} emoji={s.emoji} stationConfigs={stationConfigs} currentGroup={s.group} targetGroup={animationTargets[s.id] || s.group} isAnimating={!isEditMode && isAnimating} index={grp.findIndex(x => x.id === s.id)} groupSize={grp.length} onClick={isEditMode ? undefined : () => setSelectedStudentId(s.id)} isEditMode={isEditMode} />; })}
        </div>
      </div>
    </div>
  );
};

export default FloorPlan;
