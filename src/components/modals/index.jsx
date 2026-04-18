import React, { Suspense, lazy } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { DEFAULT_ROTATION_ORDER } from '../../constants';
import LoadingSpinner from '../shared/LoadingSpinner';

const StudentManager = lazy(() => import('./StudentManager'));
const RosterManager = lazy(() => import('./RosterManager'));
const FirstThenEditor = lazy(() => import('./FirstThenEditor'));
const GoalEditorModal = lazy(() => import('./GoalEditorModal'));
const CustomBoxEditor = lazy(() => import('./CustomBoxEditor'));
const StudentProfileModal = lazy(() => import('./StudentProfileModal'));
const TextBoxEditor = lazy(() => import('./TextBoxEditor'));

const Modals = () => {
  const {
    showStudentManager,
    setShowStudentManager,
    showRosterManager,
    setShowRosterManager,
    showFirstThenEditor,
    setShowFirstThenEditor,
    showGoalEditor,
    setShowGoalEditor,
    editingBox,
    setEditingBox,
    showTextBoxEditor,
    setShowTextBoxEditor,
    editingTextBoxId,
    setEditingTextBoxId,
    textBoxes,
    setTextBoxes,
    selectedStudentId,
    setSelectedStudentId,
    students,
    setStudents,
    globalRoster,
    setGlobalRoster,
    floorPlansByLayout,
    setFloorPlansByLayout,
    teacherNames,
    setTeacherNames,
    stationColors,
    setStationColors,
    rotationOrder,
    setRotationOrder,
    stationConfigs,
    firstThen,
    setFirstThen,
    studentGoals,
    setStudentGoals,
    tokenHistory,
    setTokenHistory,
    studentNotes,
    setStudentNotes,
    studentGoalLadders,
    setStudentGoalLadders,
    studentSchedules,
    setStudentSchedules,
    customBoxes,
    setCustomBoxes,
    tabStationKeys,
    customStationColors,
    setCustomStationColorsForPlan,
    activeLayoutId,
    activeFloorPlanId,
    addCustomStation,
    removeStationFromTab,
  } = useAppState();

  return (
    <>
      {showStudentManager && (
        <Suspense fallback={<LoadingSpinner />}>
          <StudentManager
            key={`${activeLayoutId}-${activeFloorPlanId}`}
            students={students}
            onUpdate={setStudents}
            onClose={() => setShowStudentManager(false)}
            roster={globalRoster}
            stationConfigs={stationConfigs}
            teacherNames={teacherNames}
            onUpdateTeachers={setTeacherNames}
            stationColors={stationColors}
            onUpdateStationColors={setStationColors}
            rotationOrder={rotationOrder}
            onUpdateRotationOrder={setRotationOrder}
            customStationKeys={tabStationKeys.filter((k) => !DEFAULT_ROTATION_ORDER.includes(k))}
            customStationColors={customStationColors}
            onUpdateCustomStationColors={setCustomStationColorsForPlan}
            studentGoals={studentGoals}
            onUpdateGoals={setStudentGoals}
            onAddStation={addCustomStation}
            onDeleteStation={removeStationFromTab}
          />
        </Suspense>
      )}
      {showFirstThenEditor && (
        <Suspense fallback={<LoadingSpinner />}>
          <FirstThenEditor
            firstThen={firstThen}
            onUpdate={setFirstThen}
            onClose={() => setShowFirstThenEditor(false)}
          />
        </Suspense>
      )}
      {showRosterManager && (
        <Suspense fallback={<LoadingSpinner />}>
          <RosterManager
            roster={globalRoster}
            onUpdateRoster={(updatedRoster) => {
              setGlobalRoster(updatedRoster);
              // Sync name/photo/emoji to any floor plan students linked via rosterId
              const rosterMap = new Map(updatedRoster.map((r) => [r.id, r]));
              setFloorPlansByLayout((prev) => {
                const next = {};
                for (const layoutId of Object.keys(prev)) {
                  const layoutSet = prev[layoutId];
                  next[layoutId] = {
                    ...layoutSet,
                    floorPlans: layoutSet.floorPlans.map((fp) => ({
                      ...fp,
                      students: (fp.students || []).map((s) => {
                        if (!s.rosterId) return s;
                        const r = rosterMap.get(s.rosterId);
                        if (!r) return s;
                        return { ...s, name: r.name, photo: r.photo ?? null, emoji: r.emoji ?? null };
                      }),
                    })),
                  };
                }
                return next;
              });
            }}
            studentGoals={studentGoals}
            onUpdateGoals={setStudentGoals}
            onClose={() => setShowRosterManager(false)}
          />
        </Suspense>
      )}
      {showGoalEditor && (
        <Suspense fallback={<LoadingSpinner />}>
          <GoalEditorModal
            students={students}
            goals={studentGoals}
            onUpdate={setStudentGoals}
            onClose={() => setShowGoalEditor(false)}
          />
        </Suspense>
      )}
      {editingBox && (
        <Suspense fallback={<LoadingSpinner />}>
          <CustomBoxEditor
            box={editingBox}
            onUpdate={(b) => setCustomBoxes((p) => p.map((x) => (x.id === b.id ? b : x)))}
            onDelete={(id) => setCustomBoxes((p) => p.filter((x) => x.id !== id))}
            onClose={() => setEditingBox(null)}
            students={students}
          />
        </Suspense>
      )}
      {selectedStudentId &&
        (() => {
          const student = students.find((s) => s.id === selectedStudentId);
          // Key all data by rosterId so it matches globalRoster lookups in StudentsPanel
          const dataKey = student?.rosterId || selectedStudentId;
          const goal = studentGoals[dataKey] || {
            tokens: 0,
            goal: 5,
            reward: '🎮 Free Time',
            active: false,
          };
          const today = new Date().toISOString().slice(0, 10);
          return (
            <Suspense fallback={<LoadingSpinner />}>
              <StudentProfileModal
                student={student}
                goal={goal}
                tokenHistory={tokenHistory}
                studentNotes={studentNotes}
                studentGoalLadders={studentGoalLadders}
                studentSchedules={studentSchedules}
                dataKey={dataKey}
                onUpdateSchedule={(key, updated) => {
                  setStudentSchedules(prev => ({ ...prev, [key]: updated }));
                }}
                onAddToken={() => {
                  const g = studentGoals[dataKey] || {
                    tokens: 0,
                    goal: 5,
                    reward: '🎮 Free Time',
                    active: true,
                  };
                  if (g.tokens < g.goal) {
                    setStudentGoals((prev) => ({
                      ...prev,
                      [dataKey]: { ...g, tokens: g.tokens + 1 },
                    }));
                    setTokenHistory((prev) => {
                      const h = prev[dataKey] || {};
                      return { ...prev, [dataKey]: { ...h, [today]: (h[today] || 0) + 1 } };
                    });
                  }
                }}
                onRemoveToken={() => {
                  const g = studentGoals[dataKey] || {
                    tokens: 0,
                    goal: 5,
                    reward: '🎮 Free Time',
                    active: true,
                  };
                  if (g.tokens > 0) {
                    setStudentGoals((prev) => ({
                      ...prev,
                      [dataKey]: { ...g, tokens: g.tokens - 1 },
                    }));
                    setTokenHistory((prev) => {
                      const h = prev[dataKey] || {};
                      const cur = h[today] || 0;
                      if (cur <= 0) return prev;
                      return { ...prev, [dataKey]: { ...h, [today]: cur - 1 } };
                    });
                  }
                }}
                onResetTokens={() => {
                  const g = studentGoals[dataKey] || {
                    tokens: 0,
                    goal: 5,
                    reward: '🎮 Free Time',
                    active: true,
                  };
                  setStudentGoals((prev) => ({
                    ...prev,
                    [dataKey]: { ...g, tokens: 0 },
                  }));
                }}
                onUpdateNotes={(key, text) => {
                  setStudentNotes((prev) => ({ ...prev, [key]: text }));
                }}
                onUpdateGoalLadder={(key, updated) => {
                  setStudentGoalLadders((prev) => ({ ...prev, [key]: updated }));
                }}
                onClose={() => setSelectedStudentId(null)}
              />
            </Suspense>
          );
        })()}
      {showTextBoxEditor && editingTextBoxId && (
        <Suspense fallback={<LoadingSpinner />}>
          <TextBoxEditor
            textBoxId={editingTextBoxId}
            config={textBoxes[editingTextBoxId] || {}}
            onUpdate={(id, newConfig) => {
              setTextBoxes((prev) => ({ ...prev, [id]: newConfig }));
            }}
            onClose={() => {
              setShowTextBoxEditor(false);
              setEditingTextBoxId(null);
            }}
          />
        </Suspense>
      )}
    </>
  );
};

export default Modals;
