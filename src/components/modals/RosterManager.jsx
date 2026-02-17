import React, { useState } from 'react';
import { STUDENT_EMOJI_OPTIONS } from '../../constants';
import EmojiPicker from './EmojiPicker';

const RosterManager = ({ roster, onUpdateRoster, onClose }) => {
  const [editingRoster, setEditingRoster] = useState([...(roster || [])]);
  const [emojiPickerFor, setEmojiPickerFor] = useState(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="roster-manager-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
      >
          <div className="p-3 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
            <h2 id="roster-manager-title" className="text-lg font-bold text-gray-800">
              📋 Student Roster
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl" aria-label="Close modal">
              ✕
            </button>
          </div>
        <div className="p-3 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-gray-700">All Students</div>
            <button
              onClick={() =>
                setEditingRoster((prev) => [
                  ...prev,
                  { id: `r-${Date.now()}`, name: 'New Student', photo: null, emoji: null },
                ])
              }
              className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-100"
            >
              + Add Student
            </button>
          </div>
          <div className="space-y-2">
            {editingRoster.map((student) => (
              <div key={student.id} className="p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 relative">
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : student.emoji ? (
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl border-2 border-purple-300">
                        {student.emoji}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 border-2 border-gray-400">
                        {student.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={student.name}
                    onChange={(e) =>
                      setEditingRoster((prev) =>
                        prev.map((s) => (s.id === student.id ? { ...s, name: e.target.value } : s))
                      )
                    }
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={() =>
                      setEditingRoster((prev) => prev.filter((s) => s.id !== student.id))
                    }
                    className="text-xs px-2 py-1 rounded bg-red-50 text-red-500 hover:bg-red-100"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-1 ml-12">
                  <label className="cursor-pointer text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setEditingRoster((prev) =>
                            prev.map((s) =>
                              s.id === student.id
                                ? { ...s, photo: ev.target.result, emoji: null }
                                : s
                            )
                          );
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    📷 Photo
                  </label>
                  <button
                    onClick={() =>
                      setEmojiPickerFor(emojiPickerFor === student.id ? null : student.id)
                    }
                    className={`text-xs px-1.5 py-0.5 rounded ${emojiPickerFor === student.id ? 'bg-purple-200 text-purple-700' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
                  >
                    😀 Emoji
                  </button>
                  {(student.photo || student.emoji) && (
                    <button
                      onClick={() =>
                        setEditingRoster((prev) =>
                          prev.map((s) =>
                            s.id === student.id ? { ...s, photo: null, emoji: null } : s
                          )
                        )
                      }
                      className="text-xs px-1.5 py-0.5 bg-red-50 text-red-500 rounded hover:bg-red-100"
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>
                {emojiPickerFor === student.id && (
                  <EmojiPicker
                    emojis={STUDENT_EMOJI_OPTIONS}
                    selected={student.emoji}
                    onSelect={(em) => {
                      setEditingRoster((prev) =>
                        prev.map((s) =>
                          s.id === student.id ? { ...s, emoji: em, photo: null } : s
                        )
                      );
                      setEmojiPickerFor(null);
                    }}
                  />
                )}
              </div>
            ))}
            {editingRoster.length === 0 && (
              <div className="text-xs text-gray-400">No roster students yet.</div>
            )}
          </div>
        </div>
        <div className="p-3 border-t bg-gray-50 flex gap-2 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUpdateRoster(editingRoster);
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RosterManager;
