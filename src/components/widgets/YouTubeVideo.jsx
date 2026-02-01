import React, { useEffect, useState } from 'react';

const normalizeYouTubeUrl = (input) => {
  const value = (input || '').trim();
  if (!value) return { url: '', error: 'Paste a YouTube link.' };

  const idMatch =
    value.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/i) ||
    value.match(/[?&]v=([a-zA-Z0-9_-]{6,})/i) ||
    value.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/i);

  if (!idMatch || !idMatch[1]) {
    return { url: '', error: 'That does not look like a valid YouTube link.' };
  }

  const id = idMatch[1];
  return { url: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`, error: '' };
};

const YouTubeVideo = ({ url, onChange }) => {
  const [editing, setEditing] = useState(!url);
  const [value, setValue] = useState(url || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) setValue(url || '');
  }, [url, editing]);

  const handleSave = () => {
    const { url: normalized, error: err } = normalizeYouTubeUrl(value);
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
        <div className="text-xs font-bold text-gray-500">🎥 YOUTUBE VIDEO</div>
        <input
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          className="w-full px-2 py-1 rounded text-sm border text-gray-800"
          placeholder="Paste a YouTube link"
          autoFocus
        />
        {error && <div className="text-xs text-red-500">{error}</div>}
        <div className="flex items-center gap-2 justify-end mt-auto">
          <button onClick={() => { setEditing(false); setError(''); }}
            className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300">Cancel</button>
          <button onClick={handleSave}
            className="px-2 py-1 bg-gray-700 text-white rounded text-xs font-medium hover:bg-gray-800">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-md h-full relative overflow-hidden">
      {!url ? (
        <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-gray-500">
          <div className="text-sm font-semibold">YouTube Video</div>
          <button onClick={() => setEditing(true)} className="px-3 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200">
            Add YouTube Link
          </button>
        </div>
      ) : (
        <>
          <iframe
            title="YouTube Video"
            src={url}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

export default YouTubeVideo;
