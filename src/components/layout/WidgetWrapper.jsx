import React, { useState } from 'react';
import widgetRegistry from '../../config/widgetRegistry';
import { useAppState } from '../../context/AppStateContext';
import { BANNER_COLORS } from '../../constants';

const WIDGET_COLORS = [
  null,
  ...BANNER_COLORS,
  '#A3E635', // Lime (unique, not in BANNER_COLORS)
  '#22D3EE', // Cyan (unique, not in BANNER_COLORS)
];

const WidgetWrapper = React.forwardRef(
  ({ id, isLayoutEditMode, isKioskMode = false, onRemove, onResize, children, style, className, ...rest }, ref) => {
    const meta = widgetRegistry[id];
    const label = meta ? meta.label : id;
    const { widgetColors, setWidgetColors, performanceMode } = useAppState();
    const skipAnimations = performanceMode || id === 'floorplan';
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [colorTab, setColorTab] = useState('bg');

    // Support legacy string format and new {bg, border, text, style} format
    const raw = widgetColors[id] || null;
    const widgetBg = typeof raw === 'string' ? raw : raw?.bg || null;
    const widgetBorder = typeof raw === 'string' ? null : raw?.border || null;
    const widgetText = typeof raw === 'string' ? null : raw?.text || null;
    const widgetStyle = typeof raw === 'string' ? null : raw?.style || null;

    const handleColorChange = (field, color) => {
      setWidgetColors((prev) => {
        const next = { ...prev };
        const existing = prev[id];
        const current =
          typeof existing === 'string'
            ? { bg: existing, border: null, text: null, style: null }
            : existing || { bg: null, border: null, text: null, style: null };
        const updated = { ...current, [field]: color };
        if (!updated.bg && !updated.border && !updated.text && !updated.style) {
          delete next[id];
        } else {
          next[id] = updated;
        }
        return next;
      });
    };

    const borderStyle = widgetBorder ? `3px solid ${widgetBorder}` : 'none';

    const wrapperStyle = showColorPicker ? { ...style, zIndex: 9999 } : style;

    return (
      <div ref={ref} style={wrapperStyle} className={className} {...rest}>
        {isLayoutEditMode && !isKioskMode && (
          <div className={`absolute top-1 z-[100] flex items-center gap-1 ${id === 'floorplan' || id === 'timerPanel' ? 'right-32' : 'right-1'}`}>
            {onResize && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResize(id, -1);
                  }}
                  className="w-5 h-5 flex items-center justify-center rounded bg-gray-500/70 hover:bg-gray-600/80 text-white backdrop-blur-sm font-bold"
                  style={{ fontSize: 14 }}
                  title="Shrink"
                >
                  −
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResize(id, 1);
                  }}
                  className="w-5 h-5 flex items-center justify-center rounded bg-gray-500/70 hover:bg-gray-600/80 text-white backdrop-blur-sm font-bold"
                  style={{ fontSize: 14 }}
                  title="Expand"
                >
                  +
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="w-5 h-5 flex items-center justify-center rounded bg-gray-500/70 hover:bg-gray-600/80 text-white backdrop-blur-sm"
              style={{ fontSize: 12 }}
              title="Change color"
            >
              🎨
            </button>
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(id);
                }}
                className="w-5 h-5 flex items-center justify-center rounded bg-red-500/80 hover:bg-red-600 text-white backdrop-blur-sm"
                style={{ fontSize: 10 }}
                title={`Remove ${label}`}
              >
                ✕
              </button>
            )}
          </div>
        )}
        {showColorPicker && isLayoutEditMode && !isKioskMode && (
          <div
            className={`absolute top-8 z-[200] bg-white rounded-card shadow-widget-lg border p-2 max-h-[60vh] overflow-y-auto ${id === 'floorplan' || id === 'timerPanel' ? 'right-32' : 'right-1'}`}
            style={{ width: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Color
            </div>
            <div className="flex gap-1 mb-2">
              <button
                onClick={() => setColorTab('bg')}
                className={`flex-1 text-[11px] py-1 rounded font-bold ${colorTab === 'bg' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                Fill
              </button>
              <button
                onClick={() => setColorTab('border')}
                className={`flex-1 text-[11px] py-1 rounded font-bold ${colorTab === 'border' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                Border
              </button>
              <button
                onClick={() => setColorTab('text')}
                className={`flex-1 text-[11px] py-1 rounded font-bold ${colorTab === 'text' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                Text
              </button>
            </div>
            <div className="mb-2 max-h-28 overflow-y-auto pr-1">
              <div className="flex flex-wrap gap-1.5">
                {WIDGET_COLORS.map((c, i) => {
                  const active =
                    colorTab === 'bg'
                      ? widgetBg === c
                      : colorTab === 'border'
                        ? widgetBorder === c
                        : widgetText === c;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        handleColorChange(colorTab, c);
                      }}
                      className={`w-6 h-6 rounded-full border-[3px] ${active ? 'border-gray-900 ring-2 ring-blue-500 ring-offset-1 ring-offset-white' : 'border-gray-200'}`}
                      style={{ backgroundColor: c || '#ffffff' }}
                      title={c === null ? 'None' : c}
                    />
                  );
                })}
              </div>
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Style
            </div>
            <div className="grid grid-cols-2 gap-1">
              {[
                { id: null, label: 'Normal' },
                { id: 'glass', label: 'Liquid Glass' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleColorChange('style', opt.id)}
                  className={`px-2 py-1 text-[11px] rounded font-bold text-left ${widgetStyle === opt.id ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400' : 'bg-gray-100 text-gray-600'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div
          className={`h-full w-full overflow-hidden relative rounded-widget ${!widgetStyle ? 'shadow-widget' : ''}`}
          data-widget-style={widgetStyle || 'normal'}
          data-widget-text={widgetText ? 'on' : undefined}
          style={{
            backgroundColor:
              widgetStyle === 'glass'
                ? widgetBg || 'rgba(255,255,255,0.6)'
                : widgetBg || '#ffffff',
            border: borderStyle,
            '--widget-border-color': widgetBorder || 'transparent',
            '--widget-text-color': widgetText || 'inherit',
            color: widgetText || 'inherit',
            // Performance mode: disable expensive backdrop-filter
            backdropFilter:
              widgetStyle === 'glass' && !skipAnimations ? 'blur(12px) saturate(1.4)' : 'none',
            WebkitBackdropFilter:
              widgetStyle === 'glass' && !skipAnimations ? 'blur(12px) saturate(1.4)' : 'none',
            // Performance mode: use simpler box-shadows
            boxShadow: skipAnimations
              ? widgetStyle === 'glass'
                ? '0 4px 12px rgba(15, 23, 42, 0.1)'
                : undefined
              : widgetStyle === 'glass'
                ? '0 10px 28px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(255,255,255,0.25)'
                : undefined,
          }}
        >
          {widgetText && (
            <style>{`
            [data-widget-text="on"] :where(p, span, div, button, label, li, input, textarea) {
              color: var(--widget-text-color) !important;
            }
            [data-widget-text="on"] ::placeholder {
              color: color-mix(in srgb, var(--widget-text-color) 65%, transparent) !important;
            }
          `}</style>
          )}
          {!widgetStyle && (
            <style>{`
            [data-widget-style="normal"] * {
              animation: none !important;
            }
          `}</style>
          )}
          {widgetStyle === 'glass' && !skipAnimations && (
            <>
              <style>{`
              @keyframes glass-sheen {
                0% { transform: translateX(-140%) skewX(-12deg); opacity: 0; }
                30% { opacity: 0.5; }
                100% { transform: translateX(140%) skewX(-12deg); opacity: 0; }
              }
              @keyframes glass-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
              }
              @keyframes glass-ripple {
                0% { transform: scale(0.98); opacity: 0.35; }
                50% { transform: scale(1.02); opacity: 0.6; }
                100% { transform: scale(0.98); opacity: 0.35; }
              }
            `}</style>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.5) 100%)',
                  borderRadius: 'inherit',
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 18% 12%, rgba(125,211,252,0.45), transparent 48%), radial-gradient(circle at 82% 88%, rgba(167,139,250,0.35), transparent 55%)',
                  borderRadius: 'inherit',
                  animation: 'glass-float 5s ease-in-out infinite',
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.35), transparent 55%)',
                  borderRadius: 'inherit',
                  animation: 'glass-ripple 6s ease-in-out infinite',
                }}
              />
              <div
                className="absolute -inset-1 pointer-events-none"
                style={{
                  borderRadius: 'inherit',
                  border: '1px solid rgba(255,255,255,0.7)',
                  boxShadow: 'inset 0 0 24px rgba(255,255,255,0.35)',
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.45) 45%, transparent 70%)',
                  width: '160%',
                  height: '200%',
                  left: '-30%',
                  top: '-50%',
                  animation: 'glass-sheen 5.5s linear infinite',
                  mixBlendMode: 'screen',
                }}
              />
            </>
          )}
          {widgetStyle === 'glass' && skipAnimations && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 100%)',
                borderRadius: 'inherit',
              }}
            />
          )}
          {widgetStyle === 'neon' && !skipAnimations && (
            <>
              <style>{`
              @keyframes neon-pulse {
                0%, 100% { opacity: 0.55; transform: scale(1); }
                50% { opacity: 0.9; transform: scale(1.02); }
              }
              @keyframes neon-scan {
                0% { transform: translateY(-120%); opacity: 0.0; }
                30% { opacity: 0.35; }
                100% { transform: translateY(120%); opacity: 0.0; }
              }
              @keyframes neon-flicker {
                0%, 100% { opacity: 1; }
                97% { opacity: 0.9; }
                98% { opacity: 0.6; }
                99% { opacity: 1; }
              }
            `}</style>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                  radial-gradient(circle at 18% 22%, rgba(34,211,238,0.45), transparent 46%),
                  radial-gradient(circle at 82% 78%, rgba(168,85,247,0.5), transparent 52%),
                  linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.35))
                `,
                  borderRadius: 'inherit',
                  animation: 'neon-pulse 3.6s ease-in-out infinite',
                }}
              />
            </>
          )}
          {widgetStyle === 'neon' && skipAnimations && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, rgba(34,211,238,0.2) 0%, rgba(168,85,247,0.2) 100%)',
                borderRadius: 'inherit',
              }}
            />
          )}
          {widgetStyle === 'aurora' && !skipAnimations && (
            <>
              <style>{`
              @keyframes aurora-drift {
                0% { transform: translateX(-8%) translateY(0); opacity: 0.7; }
                50% { transform: translateX(6%) translateY(-3%); opacity: 1; }
                100% { transform: translateX(-8%) translateY(0); opacity: 0.7; }
              }
              @keyframes aurora-shimmer {
                0% { transform: translateY(120%); opacity: 0; }
                35% { opacity: 0.35; }
                100% { transform: translateY(-120%); opacity: 0; }
              }
            `}</style>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.7) 100%)',
                  borderRadius: 'inherit',
                  opacity: 0.7,
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 20% 30%, rgba(56,189,248,0.45), transparent 50%), radial-gradient(circle at 80% 70%, rgba(167,139,250,0.4), transparent 55%), radial-gradient(circle at 50% 90%, rgba(34,197,94,0.25), transparent 50%)',
                  borderRadius: 'inherit',
                  animation: 'aurora-drift 6s ease-in-out infinite',
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.25) 45%, transparent 70%)',
                  width: '160%',
                  height: '180%',
                  left: '-30%',
                  top: '-40%',
                  animation: 'aurora-shimmer 7s linear infinite',
                  mixBlendMode: 'screen',
                }}
              />
            </>
          )}
          {widgetStyle === 'aurora' && skipAnimations && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(167,139,250,0.15) 50%, rgba(34,197,94,0.1) 100%)',
                borderRadius: 'inherit',
              }}
            />
          )}
          {widgetStyle === 'gold' && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(160deg, rgba(255,236,153,0.9) 0%, rgba(251,191,36,0.6) 35%, rgba(202,138,4,0.35) 100%)',
                borderRadius: 'inherit',
                mixBlendMode: 'multiply',
              }}
            />
          )}
          {widgetStyle === 'wood' && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, rgba(146,64,14,0.25) 0%, rgba(120,53,15,0.2) 25%, rgba(180,83,9,0.2) 50%, rgba(120,53,15,0.2) 75%, rgba(146,64,14,0.25) 100%)',
                borderRadius: 'inherit',
                opacity: 0.8,
              }}
            />
          )}
          {widgetStyle === 'neon' && !skipAnimations && (
            <>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 18px, transparent 18px 36px)',
                  borderRadius: 'inherit',
                  mixBlendMode: 'screen',
                  opacity: 0.4,
                }}
              />
              <div
                className="absolute -inset-1 pointer-events-none"
                style={{
                  borderRadius: 'inherit',
                  border: '1px solid rgba(34,211,238,0.6)',
                  boxShadow: '0 0 18px rgba(34,211,238,0.6), inset 0 0 12px rgba(168,85,247,0.35)',
                  animation: 'neon-flicker 4.8s ease-in-out infinite',
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.18) 45%, transparent 70%)',
                  height: '160%',
                  width: '140%',
                  left: '-20%',
                  top: '-30%',
                  animation: 'neon-scan 5.5s linear infinite',
                  mixBlendMode: 'screen',
                }}
              />
            </>
          )}
          {isKioskMode && (
            <div className="absolute inset-0 z-[9999] cursor-default" />
          )}
          {children}
        </div>
      </div>
    );
  }
);

WidgetWrapper.displayName = 'WidgetWrapper';

export default WidgetWrapper;
