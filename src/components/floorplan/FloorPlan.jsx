import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import FloorPlanTabs from './FloorPlanTabs';
import DraggableStation from './DraggableStation';
import DraggableBox from './DraggableBox';
import AnimatedStudent from './AnimatedStudent';

const FloorPlan = ({ isKioskMode = false }) => {
  const {
    students,
    stationConfigs,
    setStationConfigs,
    customBoxes,
    setCustomBoxes,
    teacherNames,
    allStationColors,
    tabStationKeys,
    isEditMode,
    toggleEditMode,
    isLayoutEditMode,
    floorPlanRef,
    isAnimating,
    animationTargets,
    setEditingBox,
    setSelectedStudentId,
    removeStationFromTab,
    setShowStudentManager,
    addCustomStation,
    setStudents,
    setAnimationTargets,
    setIsAnimating,
    performanceMode,
    undoRotation,
    resetRotation,
    rotationHistory,
  } = useAppState();

  // Track previous container size to detect actual resizes (not initial mount)
  const prevSizeRef = useRef(null);

  // Drag and drop state
  const [draggedStudentId, setDraggedStudentId] = useState(null);
  const [dropTargetStation, setDropTargetStation] = useState(null);
  const animationTimeoutsRef = useRef({});

  // Keyboard navigation state
  const [keyboardSelectedStudentId, setKeyboardSelectedStudentId] = useState(null);
  const [keyboardTargetStation, setKeyboardTargetStation] = useState(null);
  const [showKeyboardInstructions, setShowKeyboardInstructions] = useState(false);

  // When the floor plan container resizes, clamp all stations and boxes back into bounds
  useEffect(() => {
    const container = floorPlanRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
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
        setStationConfigs((prev) => {
          let changed = false;
          const next = { ...prev };
          for (const key of Object.keys(next)) {
            const s = next[key];
            const clampedW = Math.min(s.width, cw - margin * 2);
            const clampedH = Math.min(s.height, ch - margin * 2);
            const clampedL = Math.min(s.left, cw - clampedW - margin);
            const clampedT = Math.min(s.top, ch - clampedH - margin);
            if (
              clampedW !== s.width ||
              clampedH !== s.height ||
              clampedL !== s.left ||
              clampedT !== s.top
            ) {
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
        setCustomBoxes((prev) => {
          let changed = false;
          const next = prev.map((b) => {
            const clampedW = Math.min(b.width, cw - margin * 2);
            const clampedH = Math.min(b.height, ch - margin * 2);
            const clampedL = Math.min(b.left, cw - clampedW - margin);
            const clampedT = Math.min(b.top, ch - clampedH - margin);
            if (
              clampedW !== b.width ||
              clampedH !== b.height ||
              clampedL !== b.left ||
              clampedT !== b.top
            ) {
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

  // Cleanup animation timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(animationTimeoutsRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Add keyboard event listener for navigation
  useEffect(() => {
    const container = floorPlanRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [keyboardSelectedStudentId, keyboardTargetStation, tabStationKeys, isEditMode]);

  // Drag and drop handlers
  const handleStudentDragStart = (studentId) => {
    // Only block if THIS specific student is currently animating, or we're in edit mode
    if (animationTargets[studentId] || isEditMode) return;
    setDraggedStudentId(studentId);
  };

  const handleStudentDragEnd = () => {
    setDraggedStudentId(null);
    setDropTargetStation(null);
  };

  const handleStationDragOver = (stationKey) => {
    if (!draggedStudentId) return;
    setDropTargetStation(stationKey);
  };

  const handleStationDragLeave = () => {
    setDropTargetStation(null);
  };

  const handleStationDrop = (targetStationKey) => {
    if (!draggedStudentId || !targetStationKey) return;

    const student = students.find((s) => s.id === draggedStudentId);
    if (!student) return;

    // Don't do anything if dropping on same station
    if (student.group === targetStationKey) {
      setDraggedStudentId(null);
      setDropTargetStation(null);
      return;
    }

    const studentId = draggedStudentId;

    // Add this student to animation targets (preserving existing animations)
    setAnimationTargets((prev) => ({ ...prev, [studentId]: targetStationKey }));
    setIsAnimating(true);

    // After animation completes, update this student's group
    animationTimeoutsRef.current[studentId] = setTimeout(() => {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, group: targetStationKey } : s))
      );
      // Remove only this student from animation targets
      setAnimationTargets((prev) => {
        const next = { ...prev };
        delete next[studentId];
        // If no more students are animating, clear the global flag
        if (Object.keys(next).length === 0) {
          setIsAnimating(false);
        }
        return next;
      });
      delete animationTimeoutsRef.current[studentId];
    }, 2500); // Match ANIMATION_TRANSITION duration

    // Clear drag state
    setDraggedStudentId(null);
    setDropTargetStation(null);
  };

  // Keyboard navigation handlers
  const handleKeyboardSelectStudent = (studentId) => {
    // Only block if THIS specific student is currently animating, or we're in edit mode
    if (animationTargets[studentId] || isEditMode) return;
    setKeyboardSelectedStudentId(studentId);
    setKeyboardTargetStation(null);
    setShowKeyboardInstructions(true);
  };

  const handleKeyboardMoveStudent = () => {
    if (!keyboardSelectedStudentId || !keyboardTargetStation) return;

    const student = students.find((s) => s.id === keyboardSelectedStudentId);
    if (!student || student.group === keyboardTargetStation) {
      setKeyboardSelectedStudentId(null);
      setKeyboardTargetStation(null);
      return;
    }

    const studentId = keyboardSelectedStudentId;
    const targetStation = keyboardTargetStation;

    // Add this student to animation targets (preserving existing animations)
    setAnimationTargets((prev) => ({ ...prev, [studentId]: targetStation }));
    setIsAnimating(true);

    // After animation completes, update this student's group
    animationTimeoutsRef.current[studentId] = setTimeout(() => {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, group: targetStation } : s))
      );
      // Remove only this student from animation targets
      setAnimationTargets((prev) => {
        const next = { ...prev };
        delete next[studentId];
        // If no more students are animating, clear the global flag
        if (Object.keys(next).length === 0) {
          setIsAnimating(false);
        }
        return next;
      });
      delete animationTimeoutsRef.current[studentId];
    }, 2500);

    // Clear keyboard state
    setKeyboardSelectedStudentId(null);
    setKeyboardTargetStation(null);
  };

  const handleKeyDown = (e) => {
    if (isEditMode) return;

    // Escape cancels selection
    if (e.key === 'Escape') {
      setKeyboardSelectedStudentId(null);
      setKeyboardTargetStation(null);
      setShowKeyboardInstructions(false);
      return;
    }

    // If no student selected, ignore
    if (!keyboardSelectedStudentId) return;

    const currentStudent = students.find((s) => s.id === keyboardSelectedStudentId);
    if (!currentStudent) return;

    // Arrow keys navigate between stations
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();

      const currentStationIndex = tabStationKeys.indexOf(
        keyboardTargetStation || currentStudent.group
      );
      let nextIndex;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (currentStationIndex + 1) % tabStationKeys.length;
      } else {
        nextIndex = (currentStationIndex - 1 + tabStationKeys.length) % tabStationKeys.length;
      }

      setKeyboardTargetStation(tabStationKeys[nextIndex]);
      return;
    }

    // Enter confirms the move
    if (e.key === 'Enter') {
      e.preventDefault();
      if (keyboardTargetStation) {
        handleKeyboardMoveStudent();
      }
    }
  };

  return (
    <div className="flex flex-col gap-0 h-full">
      {!isKioskMode && (
        <div className="flex items-center justify-between px-1 pb-0">
          <FloorPlanTabs />
          <div className="flex items-center gap-1">
            {isEditMode ? (
              <>
                <button
                  onClick={addCustomStation}
                  className="px-2 py-1 rounded text-xs bg-teal-500 text-white"
                  title="Add new station"
                >
                  + Station
                </button>
                <button
                  onClick={() => setShowStudentManager(true)}
                  className="px-2 py-1 rounded text-xs bg-indigo-500 text-white"
                >
                  👥 Students/Stations
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={undoRotation}
                  className="px-2 py-1 rounded text-sm transition-all"
                  style={{
                    backgroundColor: rotationHistory ? '#DBEAFE' : '#E5E7EB',
                    color: rotationHistory ? '#1D4ED8' : '#9CA3AF',
                    opacity: isAnimating || !rotationHistory ? 0.5 : 1,
                    cursor: isAnimating || !rotationHistory ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isAnimating || !rotationHistory}
                  title="Undo last rotation"
                >
                  ↶
                </button>
                <button
                  onClick={resetRotation}
                  className="px-2 py-1 rounded text-sm bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                  style={{
                    opacity: isAnimating ? 0.5 : 1,
                    cursor: isAnimating ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isAnimating}
                  title="Reset to starting positions"
                >
                  ⟲
                </button>
              </>
            )}
            <button
              onClick={toggleEditMode}
              className={`px-2 py-1 rounded text-xs ${isEditMode ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}
            >
              {isEditMode ? '✓ Done' : '✏️ Edit'}
            </button>
          </div>
        </div>
      )}
      <div className="bg-transparent rounded-b-xl rounded-tr-xl shadow-lg p-2 flex-1 flex flex-col min-h-0">
        <div
          ref={floorPlanRef}
          className="flex-1 relative bg-transparent rounded-lg overflow-hidden focus:outline-none"
          style={{ border: isEditMode ? '2px dashed #3B82F6' : 'none' }}
          tabIndex={0}
        >
          {tabStationKeys.map((c) => (
            <DraggableStation
              key={c}
              color={c}
              config={stationConfigs[c]}
              onUpdate={(col, cfg) => setStationConfigs((p) => ({ ...p, [col]: cfg }))}
              isEditMode={isEditMode}
              isTarget={isAnimating && Object.values(animationTargets).includes(c)}
              containerRef={floorPlanRef}
              students={students}
              teacherName={teacherNames[c] || c}
              stationColors={allStationColors}
              onRemove={removeStationFromTab}
              isDropTarget={dropTargetStation === c}
              onDragOver={() => handleStationDragOver(c)}
              onDragLeave={handleStationDragLeave}
              onDrop={() => handleStationDrop(c)}
              isKeyboardTarget={keyboardTargetStation === c}
            />
          ))}
          {customBoxes.map((b) => (
            <DraggableBox
              key={b.id}
              box={b}
              onUpdate={(ub) => setCustomBoxes((p) => p.map((x) => (x.id === ub.id ? ub : x)))}
              isEditMode={isEditMode}
              containerRef={floorPlanRef}
              onEdit={setEditingBox}
              students={students}
            />
          ))}
          {students
            .filter((s) => stationConfigs[s.group])
            .map((s) => {
              const grp = students.filter((x) => x.group === s.group && stationConfigs[x.group]);
              return (
                <AnimatedStudent
                  key={s.id}
                  studentId={s.id}
                  name={s.name}
                  photo={s.photo}
                  emoji={s.emoji}
                  stationConfigs={stationConfigs}
                  currentGroup={s.group}
                  targetGroup={animationTargets[s.id] || s.group}
                  isAnimating={!isEditMode && isAnimating}
                  index={grp.findIndex((x) => x.id === s.id)}
                  groupSize={grp.length}
                  onClick={
                    isEditMode
                      ? undefined
                      : (e) => {
                          if (e.shiftKey) {
                            // Shift+Click activates keyboard navigation
                            handleKeyboardSelectStudent(s.id);
                          } else {
                            // Normal click opens token board
                            setSelectedStudentId(s.id);
                          }
                        }
                  }
                  isEditMode={isEditMode}
                  isLayoutEditMode={isLayoutEditMode}
                  onDragStart={handleStudentDragStart}
                  onDragEnd={handleStudentDragEnd}
                  isDragging={draggedStudentId === s.id}
                  isKeyboardSelected={keyboardSelectedStudentId === s.id}
                  performanceMode={performanceMode}
                  isAnyStudentBeingDragged={!!draggedStudentId}
                />
              );
            })}
        </div>

        {/* Keyboard Navigation Instructions */}
        {showKeyboardInstructions && keyboardSelectedStudentId && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-xs flex items-center gap-3 z-30">
            <span className="font-bold">
              {students.find((s) => s.id === keyboardSelectedStudentId)?.name} selected
            </span>
            <span className="text-blue-200">|</span>
            <span>↑↓ or ←→: Choose station</span>
            <span className="text-blue-200">|</span>
            <span className="font-bold">Enter: Move</span>
            <span className="text-blue-200">|</span>
            <span>Esc: Cancel</span>
            <button
              onClick={() => {
                setKeyboardSelectedStudentId(null);
                setKeyboardTargetStation(null);
                setShowKeyboardInstructions(false);
              }}
              className="ml-2 text-blue-100 hover:text-white"
              aria-label="Close keyboard instructions"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorPlan;
