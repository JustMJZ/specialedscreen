import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import GoalLadder from '../widgets/GoalLadder';
import Clock from '../widgets/Clock';
import FloorPlan from '../floorplan/FloorPlan';
import GoogleSlides from '../widgets/GoogleSlides';
import YouTubeVideo from '../widgets/YouTubeVideo';

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
    rightNowText, setRightNowText, bannerFontSize, setBannerFontSize,
    isEditMode, isAnimating,
    voiceLevel, setVoiceLevel,
    firstThen, setShowFirstThenEditor,
    students, animationTargets, teacherNames, allStationColors, rotationOrder, setRotationOrder,
    tabStationKeys,
    countdownEvent, countdownTime, setCountdownEvent, setCountdownTime,
    quickMessage, setQuickMessage, quickMessageFontSize, setQuickMessageFontSize,
    starPoints, setStarPoints,
    goalLadder, setGoalLadder,
    googleSlidesUrl, setGoogleSlidesUrl,
    youtubeVideoUrl, setYoutubeVideoUrl,
    layoutTabs, setLayoutTabs, activeLayoutId,
  } = state;

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [containerHeight, setContainerHeight] = useState(600);

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate max rows based on container height (rowHeight = 30)
  const rowHeight = 30;
  const maxRows = Math.ceil(containerHeight / rowHeight);

  const activeLayoutTab = useMemo(() => {
    if (!Array.isArray(layoutTabs) || layoutTabs.length === 0) return null;
    return layoutTabs.find(t => t.id === activeLayoutId) || layoutTabs[0];
  }, [layoutTabs, activeLayoutId]);

  const activeLayout = useMemo(() => {
    if (!activeLayoutTab) return defaultLayout;
    return Array.isArray(activeLayoutTab.layout) ? activeLayoutTab.layout : defaultLayout;
  }, [activeLayoutTab]);

  const layoutWithMins = useMemo(() => applyMinSizes(activeLayout), [activeLayout]);

  // When not in layout edit mode, mark all items static so the grid
  // never intercepts pointer events meant for widgets (e.g. floor plan drag).
  const layout = isLayoutEditMode
    ? layoutWithMins.map(item => ({ ...item, static: false }))
    : layoutWithMins.map(item => ({ ...item, static: true }));

  const handleLayoutChange = useCallback((newLayout) => {
    const cleaned = newLayout.map(({ static: _s, ...rest }) => rest);
    setLayoutTabs(prev => prev.map(tab => {
      if (tab.id !== activeLayoutTab?.id) return tab;
      return { ...tab, layout: applyMinSizes(cleaned) };
    }));
  }, [setLayoutTabs, activeLayoutTab]);

  const resetLayout = useCallback(() => {
    const reset = applyMinSizes(defaultLayout);
    setLayoutTabs(prev => prev.map(tab => {
      if (tab.id !== activeLayoutTab?.id) return tab;
      return { ...tab, layout: reset };
    }));
  }, [setLayoutTabs, activeLayoutTab]);

  const removeWidget = useCallback((widgetId) => {
    setLayoutTabs(prev => prev.map(tab => {
      if (tab.id !== activeLayoutTab?.id) return tab;
      const next = (tab.layout || []).filter(item => item.i !== widgetId);
      return { ...tab, layout: next };
    }));
  }, [setLayoutTabs, activeLayoutTab]);

  const resizeWidget = useCallback((widgetId, delta) => {
    setLayoutTabs(prev => prev.map(tab => {
      if (tab.id !== activeLayoutTab?.id) return tab;
      const updated = (tab.layout || []).map(item => {
        if (item.i !== widgetId) return item;
        const meta = widgetRegistry[widgetId];
        const minW = meta?.minW || 1;
        const minH = meta?.minH || 1;
        return {
          ...item,
          w: Math.max(minW, item.w + delta),
          h: Math.max(minH, item.h + delta),
        };
      });
      return { ...tab, layout: updated };
    }));
  }, [setLayoutTabs, activeLayoutTab]);

  const addWidget = useCallback((widgetId) => {
    setLayoutTabs(prev => prev.map(tab => {
      if (tab.id !== activeLayoutTab?.id) return tab;
      const existing = tab.layout || [];
      if (existing.some(item => item.i === widgetId)) return tab;
      const meta = widgetRegistry[widgetId];
      // Place at top-left (0,0) - react-grid-layout will compact and adjust
      const newItem = {
        i: widgetId,
        x: 0,
        y: 0,
        w: meta ? meta.defaultW : 5,
        h: meta ? meta.defaultH : 2,
        minW: meta ? meta.minW : 2,
        minH: meta ? meta.minH : 1,
      };
      return { ...tab, layout: [...existing, newItem] };
    }));
  }, [setLayoutTabs, activeLayoutTab]);

  useEffect(() => {
    state._resetLayout = resetLayout;
    state._removeWidget = removeWidget;
    state._addWidget = addWidget;
    state._activeWidgetIds = layoutWithMins.map(item => item.i);
  }, [resetLayout, removeWidget, addWidget, layoutWithMins, state]);

  const renderWidget = (id) => {
    switch (id) {
      case 'banner':
        return <Banner text={rightNowText} fontSize={bannerFontSize} onEdit={setRightNowText} onFontSizeChange={setBannerFontSize} />;
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
        return <StationGroups students={students} isAnimating={isAnimating} animationTargets={animationTargets} teacherNames={teacherNames} stationColors={allStationColors} rotationOrder={rotationOrder} tabStationKeys={tabStationKeys} setRotationOrder={isEditMode ? setRotationOrder : null} />;
      case 'countdown':
        return <CountdownWidget event={countdownEvent} targetTime={countdownTime} onEdit={(evt, time) => { setCountdownEvent(evt); setCountdownTime(time); }} />;
      case 'quickMessage':
        return <QuickMessage message={quickMessage} onEdit={setQuickMessage} fontSize={quickMessageFontSize} onFontSizeChange={setQuickMessageFontSize} />;
      case 'starPoints':
        return <StarPoints points={starPoints} onAdd={() => setStarPoints(p => p + 1)} onSubtract={() => setStarPoints(p => Math.max(0, p - 1))} onReset={() => setStarPoints(0)} />;
      case 'goalLadder':
        return (
          <GoalLadder
            title={goalLadder?.title}
            steps={goalLadder?.steps}
            completedCount={goalLadder?.completedCount || 0}
            onTitleChange={(title) => setGoalLadder(prev => ({ ...prev, title }))}
            onStepsChange={(updater) => setGoalLadder(prev => {
              const currentSteps = Array.isArray(prev?.steps) ? prev.steps : [];
              const nextSteps = typeof updater === 'function' ? updater(currentSteps) : updater;
              return { ...prev, steps: nextSteps };
            })}
            onCompletedChange={(count) => setGoalLadder(prev => {
              const stepCount = Array.isArray(prev?.steps) ? prev.steps.length : 0;
              const nextCount = Math.max(0, Math.min(count, stepCount));
              return { ...prev, completedCount: nextCount };
            })}
            onReset={() => setGoalLadder(prev => ({ ...prev, completedCount: 0 }))}
          />
        );
      case 'clock':
        return <Clock />;
      case 'googleSlides':
        return <GoogleSlides url={googleSlidesUrl} onChange={setGoogleSlidesUrl} />;
      case 'youtubeVideo':
        return <YouTubeVideo url={youtubeVideoUrl} onChange={setYoutubeVideoUrl} />;
      default:
        return <div className="p-2 text-gray-400 text-xs">Unknown widget: {id}</div>;
    }
  };

  return (
    <div ref={containerRef} className="h-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={rowHeight}
        maxRows={maxRows}
        width={containerWidth}
        isDraggable={isLayoutEditMode}
        isResizable={isLayoutEditMode}
        onLayoutChange={handleLayoutChange}
        compactType="vertical"
        margin={[0, 0]}
        preventCollision={false}
        isBounded={true}
      >
        {layout.map(item => (
          <WidgetWrapper key={item.i} id={item.i} isLayoutEditMode={isLayoutEditMode} onRemove={removeWidget} onResize={resizeWidget}>
            {renderWidget(item.i)}
          </WidgetWrapper>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default WidgetGrid;
