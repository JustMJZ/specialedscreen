import React from 'react';
import widgetRegistry from '../../config/widgetRegistry';

const WidgetWrapper = React.forwardRef(({ id, isLayoutEditMode, onRemove, children, style, className, ...rest }, ref) => {
  const meta = widgetRegistry[id];
  const label = meta ? meta.label : id;

  return (
    <div ref={ref} style={style} className={className} {...rest}>
      {isLayoutEditMode && (
        <div className="widget-drag-handle absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-2 py-0.5 bg-orange-400/90 text-white text-xs font-bold cursor-move rounded-t select-none"
          style={{ height: 22 }}>
          <span>☰ {label}</span>
          {onRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(id); }}
              className="w-4 h-4 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white leading-none"
              style={{ fontSize: 10 }}
              title={`Remove ${label}`}
            >✕</button>
          )}
        </div>
      )}
      <div className={`h-full w-full overflow-hidden ${isLayoutEditMode ? 'pt-[22px]' : ''}`}>
        {children}
      </div>
    </div>
  );
});

WidgetWrapper.displayName = 'WidgetWrapper';

export default WidgetWrapper;
