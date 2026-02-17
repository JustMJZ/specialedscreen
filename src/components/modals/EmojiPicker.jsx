import React, { useState } from 'react';

const PAGE_SIZE = 30;

const EmojiPicker = ({ emojis, selected, onSelect }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(emojis.length / PAGE_SIZE);
  const pageEmojis = emojis.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="mt-1 ml-12 p-1 bg-white rounded border">
      <div className="flex flex-wrap gap-1">
        {pageEmojis.map((em) => (
          <button
            key={em}
            onClick={() => onSelect(em)}
            className={`w-7 h-7 rounded text-base hover:bg-gray-100 ${selected === em ? 'bg-purple-100 ring-1 ring-purple-400' : ''}`}
          >
            {em}
          </button>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-1 mt-1 pt-1 border-t border-gray-100">
          <span className="text-[10px] text-gray-400 mr-auto">
            {page + 1}/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="text-xs px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-default"
          >
            ◀
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="text-xs px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-default"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
