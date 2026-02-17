import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';

const TemplatesModal = ({ onSelectTemplate, onClose }) => {
  const { getCustomTemplates, deleteCustomTemplate, loadCustomTemplate } = useAppState();
  const [customTemplates, setCustomTemplates] = useState([]);

  useEffect(() => {
    setCustomTemplates(getCustomTemplates());
  }, []);
  const templates = [
    {
      id: 'simpleInstruction',
      name: 'Simple Instruction',
      description: 'Clean layout with text instructions, timer, and floor plan',
      preview: (
        <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
          <div className="p-2 grid grid-cols-12 gap-1" style={{ height: '160px' }}>
            {/* Left side - TextBox and Timer stacked */}
            <div className="col-span-6 flex flex-col gap-1">
              {/* TextBox */}
              <div className="flex-[3] bg-white rounded border-2 border-gray-300 shadow-sm p-2">
                <div className="text-[8px] font-bold text-gray-700 mb-1">Instructions</div>
                <div className="space-y-0.5">
                  <div className="text-[6px] text-gray-600">1. Sit at your desk</div>
                  <div className="text-[6px] text-gray-600">2. Get materials</div>
                  <div className="text-[6px] text-gray-600">3. Wait quietly</div>
                </div>
              </div>

              {/* Timer Panel */}
              <div className="flex-[2] bg-gradient-to-br from-indigo-900 to-purple-900 rounded border border-gray-300 shadow-sm flex items-center justify-center">
                <div className="text-white text-[12px] font-bold">15:00</div>
              </div>
            </div>

            {/* Right side - Floor Plan */}
            <div className="col-span-6 bg-white rounded border border-gray-300 shadow-sm p-1.5 flex flex-col">
              <div className="text-[6px] text-gray-400 mb-1">Floor Plan</div>
              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1">
                <div className="bg-purple-200 rounded flex items-center justify-center text-[7px] font-medium">Station 1</div>
                <div className="bg-yellow-200 rounded flex items-center justify-center text-[7px] font-medium">Station 2</div>
                <div className="bg-blue-200 rounded flex items-center justify-center text-[7px] font-medium">Station 3</div>
                <div className="bg-green-200 rounded flex items-center justify-center text-[7px] font-medium">Station 4</div>
              </div>
            </div>
          </div>
        </div>
      ),
      features: [
        'Text box for instructions',
        'Timer panel',
        'Floor plan with 4 stations',
        'Clean, focused layout',
        'Perfect for daily routines',
        'Easy to customize',
      ],
    },
    {
      id: 'essential',
      name: 'Essential Classroom',
      description: 'Core features for station rotations and classroom management',
      preview: (
        <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
          {/* Banner */}
          <div className="h-3 bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
            <div className="text-[7px] font-bold text-white">Welcome to Class!</div>
          </div>

          <div className="p-2 grid grid-cols-12 gap-1" style={{ height: '140px' }}>
            {/* Floor Plan - Large left side */}
            <div className="col-span-8 bg-white rounded border border-gray-300 shadow-sm p-1 flex flex-col">
              <div className="text-[6px] text-gray-400 mb-1">Floor Plan</div>
              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1">
                <div className="bg-purple-200 rounded flex items-center justify-center text-[6px] font-medium">Smith</div>
                <div className="bg-yellow-200 rounded flex items-center justify-center text-[6px] font-medium">Johnson</div>
                <div className="bg-blue-200 rounded flex items-center justify-center text-[6px] font-medium">Davis</div>
                <div className="bg-green-200 rounded flex items-center justify-center text-[6px] font-medium">Garcia</div>
              </div>
            </div>

            {/* Right column */}
            <div className="col-span-4 flex flex-col gap-1">
              {/* Timer Panel - Top right, taller */}
              <div className="flex-1 bg-gradient-to-br from-indigo-900 to-purple-900 rounded border border-gray-300 shadow-sm flex items-center justify-center">
                <div className="text-white text-[10px] font-bold">01:00</div>
              </div>

              {/* Station Groups - Below timer */}
              <div className="h-12 bg-white rounded border border-gray-300 shadow-sm p-1">
                <div className="text-[5px] text-gray-400 mb-0.5">Groups</div>
                <div className="space-y-0.5">
                  <div className="h-1.5 bg-purple-100 rounded"></div>
                  <div className="h-1.5 bg-yellow-100 rounded"></div>
                  <div className="h-1.5 bg-blue-100 rounded"></div>
                  <div className="h-1.5 bg-green-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="px-2 pb-2 grid grid-cols-12 gap-1">
            {/* Voice Level */}
            <div className="col-span-3 h-12 bg-yellow-50 rounded border border-yellow-300 shadow-sm flex items-center justify-center">
              <div className="text-[7px] font-medium text-yellow-700">🤫 Voice</div>
            </div>

            {/* Clock */}
            <div className="col-span-5 h-12 bg-white rounded border border-gray-300 shadow-sm flex items-center justify-center">
              <div className="text-[8px] font-bold text-gray-700">04:02 PM</div>
            </div>

            {/* First/Then */}
            <div className="col-span-4 h-12 bg-gradient-to-r from-blue-400 to-green-400 rounded border border-gray-300 shadow-sm flex items-center justify-center gap-1">
              <div className="text-[6px] text-white font-medium">📚→🎮</div>
            </div>
          </div>
        </div>
      ),
      features: [
        'Floor Plan with 4 stations',
        'Timer & rotation controls',
        'Voice level monitor',
        'First/Then board',
        'Station groups display',
        'Banner & clock widgets',
      ],
    },
  ];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Templates</h2>
            <p className="text-sm text-gray-500 mt-1">
              Quick-start layouts to get you up and running
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer bg-white"
              onClick={() => {
                if (!window.confirm(`Load "${template.name}" template? This will replace your current layout.`)) return;
                onSelectTemplate(template.id);
                onClose();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-gray-700">Includes:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {template.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-purple-500 mt-0.5">✓</span>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors w-full md:w-auto">
                    Load Template
                  </button>
                </div>

                {/* Right: Preview */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Preview</div>
                  {template.preview}
                </div>
              </div>
            </div>
          ))}

          {/* Custom Templates Section */}
          {customTemplates.length > 0 && (
            <>
              <div className="border-t-2 border-gray-200 pt-4 mt-2">
                <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>📁 Your Custom Templates</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    {customTemplates.length}
                  </span>
                </h3>
              </div>
              {customTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border-2 border-purple-200 rounded-xl p-5 hover:border-purple-400 hover:shadow-lg transition-all bg-purple-50/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{template.name}</h3>
                        <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-medium">
                          Custom
                        </span>
                      </div>
                      {template.description && (
                        <p className="text-gray-600 mb-3">{template.description}</p>
                      )}
                      <div className="text-xs text-gray-500">
                        Created: {new Date(template.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            if (!window.confirm(`Load "${template.name}" template? This will replace your current layout.`)) return;
                            loadCustomTemplate(template.id);
                            onClose();
                          }}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
                        >
                          Load Template
                        </button>
                        <button
                          onClick={() => {
                            if (!window.confirm(`Delete "${template.name}" template? This cannot be undone.`)) return;
                            deleteCustomTemplate(template.id);
                            setCustomTemplates(getCustomTemplates());
                          }}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Coming Soon Placeholder */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 bg-gray-50">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">➕</div>
              <div className="font-semibold">More templates coming soon!</div>
              <div className="text-sm mt-1">Station Rotation Pro, Behavior Focus, and more...</div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TemplatesModal;
