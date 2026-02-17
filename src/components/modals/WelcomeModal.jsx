import ReactDOM from 'react-dom';

const WelcomeModal = ({ onSelectTemplate, onSkip }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full z-[10000] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome to SpecialEdScreen! 🎉</h1>
          <p className="text-purple-100 text-lg">
            Let's get your classroom dashboard set up in seconds
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Start with a Template
            </h2>
            <p className="text-gray-600">
              We've created a starter layout with essential features to help you get started quickly.
              You can customize everything later!
            </p>
          </div>

          {/* Template Card */}
          <div className="border-2 border-purple-200 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-blue-50 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">📚</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Essential Classroom
                </h3>
                <p className="text-gray-600 mb-4">
                  Perfect for station rotations and classroom management. Includes:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    <span className="text-gray-700">Floor Plan with 4 stations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    <span className="text-gray-700">Timer & rotation controls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    <span className="text-gray-700">Voice level monitor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    <span className="text-gray-700">First/Then board</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    <span className="text-gray-700">Station groups display</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    <span className="text-gray-700">Sample students & data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onSelectTemplate('essential')}
              className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              Load Essential Classroom Template
            </button>
            <button
              onClick={onSkip}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Start from Scratch
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Don't worry - you can always reset or customize everything later!
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WelcomeModal;
