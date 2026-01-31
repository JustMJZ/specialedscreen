import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { DEFAULT_ROTATION_ORDER } from '../../constants';
import StudentManager from './StudentManager';
import FirstThenEditor from './FirstThenEditor';
import GoalEditorModal from './GoalEditorModal';
import CustomBoxEditor from './CustomBoxEditor';
import TokenPopup from './TokenPopup';

const Modals = () => {
  const {
    showStudentManager, setShowStudentManager,
    showFirstThenEditor, setShowFirstThenEditor,
    showGoalEditor, setShowGoalEditor,
    editingBox, setEditingBox,
    selectedStudentId, setSelectedStudentId,
    students, setStudents,
    teacherNames, setTeacherNames,
    stationColors, setStationColors,
    rotationOrder, setRotationOrder,
    firstThen, setFirstThen,
    studentGoals, setStudentGoals,
    customBoxes, setCustomBoxes,
    tabStationKeys, customStationColors,
    activeFloorPlanId, setFloorPlans,
  } = useAppState();

  return (
    <>
      {showStudentManager && (
        <StudentManager
          students={students}
          onUpdate={setStudents}
          onClose={() => setShowStudentManager(false)}
          teacherNames={teacherNames}
          onUpdateTeachers={setTeacherNames}
          stationColors={stationColors}
          onUpdateStationColors={setStationColors}
          rotationOrder={rotationOrder}
          onUpdateRotationOrder={setRotationOrder}
          customStationKeys={tabStationKeys.filter(k => !DEFAULT_ROTATION_ORDER.includes(k))}
          customStationColors={customStationColors}
          onUpdateCustomStationColors={(colors) => setFloorPlans(prev => prev.map(fp => fp.id === activeFloorPlanId ? { ...fp, customStationColors: colors } : fp))}
        />
      )}
      {showFirstThenEditor && (
        <FirstThenEditor firstThen={firstThen} onUpdate={setFirstThen} onClose={() => setShowFirstThenEditor(false)} />
      )}
      {showGoalEditor && (
        <GoalEditorModal students={students} goals={studentGoals} onUpdate={setStudentGoals} onClose={() => setShowGoalEditor(false)} />
      )}
      {editingBox && (
        <CustomBoxEditor
          box={editingBox}
          onUpdate={(b) => setCustomBoxes(p => p.map(x => x.id === b.id ? b : x))}
          onDelete={(id) => setCustomBoxes(p => p.filter(x => x.id !== id))}
          onClose={() => setEditingBox(null)}
          students={students}
        />
      )}
      {selectedStudentId && (() => {
        const student = students.find(s => s.id === selectedStudentId);
        const goal = studentGoals[selectedStudentId] || { tokens: 0, goal: 5, reward: '🎮 Free Time', active: false };
        return (
          <TokenPopup
            student={student}
            goal={goal}
            onAddToken={() => {
              const g = studentGoals[selectedStudentId] || { tokens: 0, goal: 5, reward: '🎮 Free Time', active: true };
              if (g.tokens < g.goal) {
                setStudentGoals(prev => ({ ...prev, [selectedStudentId]: { ...g, tokens: g.tokens + 1 } }));
              }
            }}
            onRemoveToken={() => {
              const g = studentGoals[selectedStudentId] || { tokens: 0, goal: 5, reward: '🎮 Free Time', active: true };
              if (g.tokens > 0) setStudentGoals(prev => ({ ...prev, [selectedStudentId]: { ...g, tokens: g.tokens - 1 } }));
            }}
            onResetTokens={() => {
              const g = studentGoals[selectedStudentId] || { tokens: 0, goal: 5, reward: '🎮 Free Time', active: true };
              setStudentGoals(prev => ({ ...prev, [selectedStudentId]: { ...g, tokens: 0 } }));
            }}
            onClose={() => setSelectedStudentId(null)}
          />
        );
      })()}
    </>
  );
};

export default Modals;
