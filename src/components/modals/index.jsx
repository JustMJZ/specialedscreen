import React, { Suspense, lazy } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { DEFAULT_ROTATION_ORDER } from '../../constants';
import LoadingSpinner from '../shared/LoadingSpinner';

const StudentManager = lazy(() => import('./StudentManager'));
const RosterManager = lazy(() => import('./RosterManager'));
const FirstThenEditor = lazy(() => import('./FirstThenEditor'));
const GoalEditorModal = lazy(() => import('./GoalEditorModal'));
const CustomBoxEditor = lazy(() => import('./CustomBoxEditor'));
const TokenPopup = lazy(() => import('./TokenPopup'));
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
            onUpdateRoster={setGlobalRoster}
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
          const goal = studentGoals[selectedStudentId] || {
            tokens: 0,
            goal: 5,
            reward: '🎮 Free Time',
            active: false,
          };
          return (
            <Suspense fallback={<LoadingSpinner />}>
              <TokenPopup
                student={student}
                goal={goal}
                onAddToken={() => {
                  const g = studentGoals[selectedStudentId] || {
                    tokens: 0,
                    goal: 5,
                    reward: '🎮 Free Time',
                    active: true,
                  };
                  if (g.tokens < g.goal) {
                    setStudentGoals((prev) => ({
                      ...prev,
                      [selectedStudentId]: { ...g, tokens: g.tokens + 1 },
                    }));
                  }
                }}
                onRemoveToken={() => {
                  const g = studentGoals[selectedStudentId] || {
                    tokens: 0,
                    goal: 5,
                    reward: '🎮 Free Time',
                    active: true,
                  };
                  if (g.tokens > 0)
                    setStudentGoals((prev) => ({
                      ...prev,
                      [selectedStudentId]: { ...g, tokens: g.tokens - 1 },
                    }));
                }}
                onResetTokens={() => {
                  const g = studentGoals[selectedStudentId] || {
                    tokens: 0,
                    goal: 5,
                    reward: '🎮 Free Time',
                    active: true,
                  };
                  setStudentGoals((prev) => ({
                    ...prev,
                    [selectedStudentId]: { ...g, tokens: 0 },
                  }));
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
