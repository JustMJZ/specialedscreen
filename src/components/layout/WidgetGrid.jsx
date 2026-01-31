import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ResponsiveGridLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAppState } from '../../context/AppStateContext';
import widgetRegistry from '../../config/widgetRegistry';
import defaultLayout from '../../config/defaultLayout';
import WidgetWrapper from './WidgetWrapper';

import TimerPanel from '../widgets/TimerPanel';
import TokenBoardCard from '../widgets/TokenBoardCard';
import VoiceLevel from '../widgets/VoiceLevel';
import FirstThen from '../widgets/FirstThen';
import StationGroups from '../widgets/StationGroups';
import Banner from '../widgets/Banner';
import CountdownWidget from '../widgets/CountdownWidget';
import QuickMessage from '../widgets/QuickMessage';
import StarPoints from '../widgets/StarPoints';
import Clock from '../widgets/Clock';
import FloorPlan from '../floorplan/FloorPlan';

const LAYOUT_STORAGE_KEY = 'specialedscreen-layout';

function loadLayout() {
  try {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return null;
}

function saveLayout(layout) {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
  } catch (e) {}
}

function applyMinSizes(layout) {
  return layout.map(item => {
    const meta = widgetRegistry[item.i];
    if (!meta) return item;
    return {
      ...item,
      minW: meta.minW,
      minH: meta.minH,
    };
  });
}

const WidgetGrid = () => {
  const state = useAppState();
  const {
    isLayoutEditMode,
    rightNowText, setRightNowText, bannerColor, setBannerColor, bannerFontSize, setBannerFontSize,
    isEditMode, isAnimating,
    voiceLevel, setVoiceLevel,
    firstThen, setShowFirstThenEditor,
    students, animationTargets, teacherNames, allStationColors, rotationOrder,
    countdownEvent, countdownTime, setCountdownEvent, setCountdownTime,
    quickMessage, setQuickMessage, quickMessageFontSize, setQuickMessageFontSize, quickMessageColor, setQuickMessageColor,
    starPoints, setStarPoints,
  } = state;

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const [savedLayout, setSavedLayout] = useState(() => {
    const saved = loadLayout();
    return applyMinSizes(saved || defaultLayout);
  });

  // When not in layout edit mode, mark all items static so the grid
  // never intercepts pointer events meant for widgets (e.g. floor plan drag).
  const layout = isLayoutEditMode
    ? savedLayout.map(item => ({ ...item, static: false }))
    : savedLayout.map(item => ({ ...item, static: true }));

  const handleLayoutChange = useCallback((newLayout) => {
    // Strip the static flag before persisting
    const cleaned = newLayout.map(({ static: _s, ...rest }) => rest);
    setSavedLayout(applyMinSizes(cleaned));
    saveLayout(cleaned);
  }, []);

  const resetLayout = useCallback(() => {
    const reset = applyMinSizes(defaultLayout);
    setSavedLayout(reset);
    saveLayout(reset);
  }, []);

  const removeWidget = useCallback((widgetId) => {
    setSavedLayout(prev => {
      const next = prev.filter(item => item.i !== widgetId);
      saveLayout(next);
      return next;
    });
  }, []);

  const addWidget = useCallback((widgetId) => {
    setSavedLayout(prev => {
      // Don't add duplicates
      if (prev.some(item => item.i === widgetId)) return prev;
      const meta = widgetRegistry[widgetId];
      const newItem = {
        i: widgetId,
        x: 0,
        y: Infinity, // place at bottom
        w: meta ? meta.defaultW : 5,
        h: meta ? meta.defaultH : 2,
        minW: meta ? meta.minW : 2,
        minH: meta ? meta.minH : 1,
      };
      const next = [...prev, newItem];
      saveLayout(next);
      return next;
    });
  }, []);

  useEffect(() => {
    state._resetLayout = resetLayout;
    state._removeWidget = removeWidget;
    state._addWidget = addWidget;
    state._activeWidgetIds = savedLayout.map(item => item.i);
  }, [resetLayout, removeWidget, addWidget, savedLayout, state]);

  const renderWidget = (id) => {
    switch (id) {
      case 'banner':
        return <Banner text={rightNowText} color={bannerColor} fontSize={bannerFontSize} onEdit={setRightNowText} onColorChange={setBannerColor} onFontSizeChange={setBannerFontSize} />;
      case 'floorplan':
        return <FloorPlan />;
      case 'timerPanel':
        return <TimerPanel />;
      case 'tokenBoard':
        return <TokenBoardCard />;
      case 'voiceLevel':
        return <VoiceLevel level={voiceLevel} onChange={setVoiceLevel} />;
      case 'firstThen':
        return <FirstThen firstThen={firstThen} onEdit={() => setShowFirstThenEditor(true)} />;
      case 'stationGroups':
        return <StationGroups students={students} isAnimating={isAnimating} animationTargets={animationTargets} teacherNames={teacherNames} stationColors={allStationColors} rotationOrder={rotationOrder} />;
      case 'countdown':
        return <CountdownWidget event={countdownEvent} targetTime={countdownTime} onEdit={(evt, time) => { setCountdownEvent(evt); setCountdownTime(time); }} />;
      case 'quickMessage':
        return <QuickMessage message={quickMessage} onEdit={setQuickMessage} fontSize={quickMessageFontSize} onFontSizeChange={setQuickMessageFontSize} color={quickMessageColor} onColorChange={setQuickMessageColor} />;
      case 'starPoints':
        return <StarPoints points={starPoints} onAdd={() => setStarPoints(p => p + 1)} onSubtract={() => setStarPoints(p => Math.max(0, p - 1))} onReset={() => setStarPoints(0)} />;
      case 'clock':
        return <Clock />;
      default:
        return <div className="p-2 text-gray-400 text-xs">Unknown widget: {id}</div>;
    }
  };

  return (
    <div ref={containerRef}>
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={30}
        width={containerWidth}
        isDraggable={isLayoutEditMode}
        isResizable={isLayoutEditMode}
        draggableHandle=".widget-drag-handle"
        onLayoutChange={handleLayoutChange}
        compactType="vertical"
        margin={[6, 6]}
      >
        {layout.map(item => (
          <WidgetWrapper key={item.i} id={item.i} isLayoutEditMode={isLayoutEditMode} onRemove={removeWidget}>
            {renderWidget(item.i)}
          </WidgetWrapper>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default WidgetGrid;
