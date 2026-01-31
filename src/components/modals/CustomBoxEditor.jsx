import React, { useState } from 'react';
import { EMOJI_OPTIONS } from '../../constants';

const CustomBoxEditor = ({ box, onUpdate, onDelete, onClose, students }) => {
  const [editing, setEditing] = useState({ ...box, assignedStudents: box.assignedStudents || [] });

  const toggleStudent = (studentId) => {
    setEditing(p => ({
      ...p,
      assignedStudents: p.assignedStudents.includes(studentId)
        ? p.assignedStudents.filter(id => id !== studentId)
        : [...p.assignedStudents, studentId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden max-h-[80vh] overflow-y-auto">
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between sticky top-0 z-10">
          <h2 className="font-bold text-gray-800">✏️ Edit Box</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>
        <div className="p-3">
          <input type="text" value={editing.label} onChange={(e) => setEditing(p => ({ ...p, label: e.target.value }))}
            className="w-full px-2 py-1 border rounded text-sm mb-2" placeholder="Label" />
          <div className="flex flex-wrap gap-1 mb-2">
            <button onClick={() => setEditing(p => ({ ...p, icon: '' }))}
              className={`w-8 h-8 rounded text-sm font-bold ${!editing.icon ? 'bg-red-100 ring-2 ring-red-400 text-red-500' : 'bg-gray-100 text-gray-400'}`}>✕</button>
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => setEditing(p => ({ ...p, icon: e }))}
                className={`w-8 h-8 rounded text-lg ${editing.icon === e ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-100'}`}>{e}</button>
            ))}
          </div>
          <div className="flex gap-1 mb-2">
            {['#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(c => (
              <button key={c} onClick={() => setEditing(p => ({ ...p, color: c }))}
                className={`w-6 h-6 rounded-full ${editing.color === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`} style={{ backgroundColor: c }} />
            ))}
          </div>
          {students && students.length > 0 && (
            <div>
              <div className="text-xs font-bold text-gray-500 mb-1">STUDENTS IN BOX</div>
              <div className="flex flex-wrap gap-1">
                {students.map(s => (
                  <label key={s.id} className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer ${editing.assignedStudents.includes(s.id) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    <input type="checkbox" checked={editing.assignedStudents.includes(s.id)} onChange={() => toggleStudent(s.id)} className="rounded" style={{ width: 12, height: 12 }} />
                    {s.name.split(' ')[0]}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-3 border-t bg-gray-50 flex justify-between">
          <button onClick={() => { onDelete(box.id); onClose(); }} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-sm">🗑️</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 text-sm">Cancel</button>
            <button onClick={() => { onUpdate(editing); onClose(); }} className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-sm">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomBoxEditor;
