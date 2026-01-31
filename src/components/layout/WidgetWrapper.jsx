import React, { useState } from 'react';
import widgetRegistry from '../../config/widgetRegistry';
import { useAppState } from '../../context/AppStateContext';
import { BANNER_COLORS } from '../../constants';

const WidgetWrapper = React.forwardRef(({ id, isLayoutEditMode, onRemove, children, style, className, ...rest }, ref) => {
  const meta = widgetRegistry[id];
  const label = meta ? meta.label : id;
  const { widgetColors, setWidgetColors } = useAppState();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const widgetColor = widgetColors[id] || null;

  const WIDGET_COLORS = [
    null, // "none" / default
    ...BANNER_COLORS,
    '#FBBF24', '#A3E635', '#34D399', '#22D3EE', '#818CF8',
  ];

  const handleColorChange = (color) => {
    setWidgetColors(prev => {
      const next = { ...prev };
      if (color === null) {
        delete next[id];
      } else {
        next[id] = color;
      }
      return next;
    });
  };

  return (
    <div ref={ref} style={style} className={className} {...rest}>
      {isLayoutEditMode && (
        <div className="widget-drag-handle absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-2 py-0.5 bg-gray-500/50 text-white text-xs cursor-move rounded-t select-none backdrop-blur-sm"
          style={{ height: 20 }}>
          <span>☰ {label}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
              className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/30 leading-none"
              style={{ fontSize: 10 }}
              title="Change color">🎨</button>
            {onRemove && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(id); }}
                className="w-4 h-4 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white leading-none"
                style={{ fontSize: 10 }}
                title={`Remove ${label}`}>✕</button>
            )}
          </div>
        </div>
      )}
      {showColorPicker && isLayoutEditMode && (
        <div className="absolute top-5 right-0 z-20 bg-white rounded-lg shadow-xl border p-2 flex flex-wrap gap-1" style={{ width: 160 }}
          onClick={(e) => e.stopPropagation()}>
          {WIDGET_COLORS.map((c, i) => (
            <button key={i} onClick={() => { handleColorChange(c); setShowColorPicker(false); }}
              className={`w-5 h-5 rounded-full border-2 ${widgetColor === c ? 'border-gray-800 ring-1 ring-gray-400' : 'border-transparent'}`}
              style={{ backgroundColor: c || '#ffffff' }}
              title={c === null ? 'Default' : c} />
          ))}
        </div>
      )}
      <div className={`h-full w-full overflow-hidden ${isLayoutEditMode ? 'pt-[22px]' : ''}`}
        style={{ backgroundColor: widgetColor || '#ffffff', borderRadius: 'inherit' }}>
        {children}
      </div>
    </div>
  );
});

WidgetWrapper.displayName = 'WidgetWrapper';

export default WidgetWrapper;
