import React, { useState } from 'react';
import widgetRegistry from '../../config/widgetRegistry';
import { useAppState } from '../../context/AppStateContext';
import { BANNER_COLORS } from '../../constants';

const WIDGET_COLORS = [
  null,
  ...BANNER_COLORS,
  '#FBBF24', '#A3E635', '#34D399', '#22D3EE', '#818CF8',
];

const WidgetWrapper = React.forwardRef(({ id, isLayoutEditMode, onRemove, children, style, className, ...rest }, ref) => {
  const meta = widgetRegistry[id];
  const label = meta ? meta.label : id;
  const { widgetColors, setWidgetColors } = useAppState();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorTab, setColorTab] = useState('bg');

  // Support legacy string format and new {bg, border} format
  const raw = widgetColors[id] || null;
  const widgetBg = typeof raw === 'string' ? raw : raw?.bg || null;
  const widgetBorder = typeof raw === 'string' ? null : raw?.border || null;

  const handleColorChange = (field, color) => {
    setWidgetColors(prev => {
      const next = { ...prev };
      const existing = prev[id];
      const current = typeof existing === 'string' ? { bg: existing, border: null } : existing || { bg: null, border: null };
      const updated = { ...current, [field]: color };
      if (!updated.bg && !updated.border) {
        delete next[id];
      } else {
        next[id] = updated;
      }
      return next;
    });
  };

  const borderStyle = widgetBorder ? `3px solid ${widgetBorder}` : 'none';

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
        <div className="absolute top-5 right-0 z-20 bg-white rounded-lg shadow-xl border p-2" style={{ width: 170 }}
          onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-1 mb-2">
            <button onClick={() => setColorTab('bg')}
              className={`flex-1 text-xs py-0.5 rounded font-bold ${colorTab === 'bg' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'}`}>Fill</button>
            <button onClick={() => setColorTab('border')}
              className={`flex-1 text-xs py-0.5 rounded font-bold ${colorTab === 'border' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'}`}>Border</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {WIDGET_COLORS.map((c, i) => {
              const active = colorTab === 'bg' ? widgetBg === c : widgetBorder === c;
              return (
                <button key={i} onClick={() => { handleColorChange(colorTab, c); }}
                  className={`w-5 h-5 rounded-full border-2 ${active ? 'border-gray-800 ring-1 ring-gray-400' : 'border-gray-200'}`}
                  style={{ backgroundColor: c || '#ffffff' }}
                  title={c === null ? 'None' : c} />
              );
            })}
          </div>
        </div>
      )}
      <div className={`h-full w-full overflow-hidden ${isLayoutEditMode ? 'pt-[22px]' : ''}`}
        style={{
          backgroundColor: widgetBg || '#ffffff',
          border: borderStyle,
          borderRadius: 'inherit',
          '--widget-border-color': widgetBorder || 'transparent',
        }}>
        {children}
      </div>
    </div>
  );
});

WidgetWrapper.displayName = 'WidgetWrapper';

export default WidgetWrapper;
