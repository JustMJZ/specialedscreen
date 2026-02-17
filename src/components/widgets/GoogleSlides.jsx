import React, { useEffect, useState } from 'react';

const DEFAULT_SLIDES_PARAMS = 'start=false&loop=false&delayms=3000';

const normalizeSlidesUrl = (input) => {
  const value = (input || '').trim();
  if (!value) return { url: '', error: 'Paste a Google Slides link.' };

  if (!value.includes('docs.google.com/presentation')) {
    return { url: '', error: 'That does not look like a Google Slides link.' };
  }

  if (value.includes('/embed')) {
    return { url: value, error: '' };
  }

  // Published link: /d/e/{id}/pub
  if (value.includes('/pub')) {
    const embedUrl = value.replace('/pub', '/embed');
    return {
      url: embedUrl.includes('?') ? embedUrl : `${embedUrl}?${DEFAULT_SLIDES_PARAMS}`,
      error: '',
    };
  }

  // Share link: /d/{id}/edit
  const match = value.match(/\/presentation\/d\/([^/]+)\//i);
  if (match && match[1]) {
    return {
      url: `https://docs.google.com/presentation/d/${match[1]}/embed?${DEFAULT_SLIDES_PARAMS}`,
      error: '',
    };
  }

  return { url: '', error: 'Use a Share or Published Google Slides link.' };
};

const GoogleSlides = ({ url, onChange }) => {
  const [editing, setEditing] = useState(!url);
  const [value, setValue] = useState(url || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) setValue(url || '');
  }, [url, editing]);

  const handleSave = () => {
    const { url: normalized, error: err } = normalizeSlidesUrl(value);
    if (err) {
      setError(err);
      return;
    }
    onChange(normalized);
    setEditing(false);
    setError('');
  };

  if (editing) {
    return (
      <div className="rounded-lg p-2 shadow-md h-full flex flex-col gap-2">
        <div className="text-xs font-bold text-gray-500">🖥️ GOOGLE SLIDES</div>
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError('');
          }}
          className="w-full px-2 py-1 rounded text-sm border text-gray-800"
          placeholder="Paste a Google Slides share or publish link"
          autoFocus
        />
        {error && <div className="text-xs text-red-500">{error}</div>}
        <div className="text-[11px] text-gray-500">
          Tip: For the best embed, use File → Share → Publish to web.
        </div>
        <div className="flex items-center gap-2 justify-end mt-auto">
          <button
            onClick={() => {
              setEditing(false);
              setError('');
            }}
            className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-2 py-1 bg-gray-700 text-white rounded text-xs font-medium hover:bg-gray-800"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-md h-full relative overflow-hidden">
      {!url ? (
        <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-gray-500">
          <div className="text-sm font-semibold">Google Slides</div>
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200"
          >
            Add Slides Link
          </button>
        </div>
      ) : (
        <>
          <iframe
            title="Google Slides"
            src={url}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
          />
          <button
            onClick={() => setEditing(true)}
            className="absolute top-2 right-2 px-2 py-1 text-[11px] bg-white/90 rounded shadow hover:bg-white"
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
};

export default GoogleSlides;
