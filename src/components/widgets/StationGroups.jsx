import React from 'react';
import { COLORS } from '../../constants';
import { useAppState } from '../../context/AppStateContext';

const StationGroups = ({
  students,
  isAnimating,
  animationTargets,
  teacherNames,
  stationColors,
  rotationOrder,
  tabStationKeys,
  setRotationOrder,
  performanceMode = false,
}) => {
  const { isWidgetLocked } = useAppState();
  const allGroups = tabStationKeys || rotationOrder;
  const rotatingSet = new Set(rotationOrder);
  const rotating = allGroups.filter((k) => rotatingSet.has(k));
  const stationary = allGroups.filter((k) => !rotatingSet.has(k));
  const ordered = [...rotating, ...stationary];

  const toggleRotation = (color) => {
    if (!setRotationOrder || isWidgetLocked) return;
    if (rotatingSet.has(color)) {
      setRotationOrder(rotationOrder.filter((k) => k !== color));
    } else {
      setRotationOrder([...rotationOrder, color]);
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <style>{`
        @keyframes sg-glow {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.02); }
        }
        @keyframes sg-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-2px); }
        }
      `}</style>

      <div
        className="flex-1 min-h-0 overflow-y-auto p-1.5"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridAutoRows: 'min-content',
          gap: '8px',
          alignContent: 'start',
        }}
      >
        {ordered.map((color) => {
          const inRotation = rotatingSet.has(color);
          const s = stationColors[color] || COLORS.stations[color] || { bg: '#9CA3AF', light: '#E5E7EB' };
          const bg = s.bg || '#9CA3AF';
          const light = s.light || s.bg || '#E5E7EB';
          const name = teacherNames[color] || color;
          const grp = students.filter((st) => st.group === color);
          const isTarget = isAnimating && Object.values(animationTargets).includes(color);

          return (
            <div
              key={color}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                border: `2px solid ${inRotation ? bg : '#E5E7EB'}`,
                opacity: !inRotation ? 0.5 : isAnimating && !isTarget ? 0.6 : 1,
                filter: !inRotation ? 'saturate(0.3)' : 'none',
                animation:
                  performanceMode || !inRotation
                    ? 'none'
                    : isTarget
                      ? 'sg-glow 1.2s ease-in-out infinite'
                      : 'sg-float 4s ease-in-out infinite',
                boxShadow: !performanceMode && isTarget ? `0 0 16px 4px ${bg}88` : undefined,
                transition: 'opacity 0.4s ease, border-color 0.3s ease',
              }}
            >
              {/* Color header bar */}
              <div
                style={{
                  background: inRotation
                    ? `linear-gradient(135deg, ${bg} 0%, ${light} 100%)`
                    : '#D1D5DB',
                  padding: '6px 10px 5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: 'clamp(11px, 1.4vw, 14px)',
                    color: '#ffffff',
                    textShadow: '0 1px 4px rgba(0,0,0,0.35)',
                    letterSpacing: '0.03em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1,
                  }}
                >
                  {name}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  {/* Student count badge */}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#ffffff',
                      background: 'rgba(0,0,0,0.22)',
                      borderRadius: 99,
                      padding: '1px 7px',
                      lineHeight: 1.5,
                    }}
                  >
                    {grp.length}
                  </span>

                  {/* Rotation toggle */}
                  {setRotationOrder && (
                    <button
                      onClick={() => toggleRotation(color)}
                      title={inRotation ? 'In rotation — click to make stationary' : 'Stationary — click to add to rotation'}
                      style={{
                        width: 34,
                        height: 18,
                        borderRadius: 99,
                        border: 'none',
                        cursor: 'pointer',
                        padding: 2,
                        background: inRotation ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.22)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: inRotation ? 'flex-end' : 'flex-start',
                        transition: 'background 0.25s ease, justify-content 0.25s ease',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          background: '#ffffff',
                          display: 'block',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                          transition: 'transform 0.25s ease',
                        }}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Student chips */}
              <div
                style={{
                  background: inRotation ? light : '#F9FAFB',
                  padding: '6px 8px 7px',
                  minHeight: 36,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px',
                  alignContent: 'flex-start',
                }}
              >
                {grp.length === 0 ? (
                  <span style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>No students</span>
                ) : (
                  grp.map((st) => (
                    <span
                      key={st.id || st.name}
                      style={{
                        fontSize: 'clamp(9px, 1.1vw, 11px)',
                        fontWeight: 700,
                        color: '#1F2937',
                        background: inRotation ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.06)',
                        border: `1px solid ${inRotation ? bg + '55' : '#E5E7EB'}`,
                        borderRadius: 99,
                        padding: '1px 7px',
                        lineHeight: 1.6,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {st.name.split(' ')[0]}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(StationGroups);
