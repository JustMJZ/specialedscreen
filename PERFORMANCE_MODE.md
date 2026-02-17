# Performance Mode Documentation

## Overview

Performance Mode is a user-toggleable setting that disables animations throughout the application for better performance on slower devices or for users who prefer reduced motion.

**Status**: ✅ Fully Implemented
**Date**: 2026-02-12

---

## How to Enable Performance Mode

### Via Header Menu
1. Click the "Tools" button in the header
2. Click the "⚡ Performance" button
3. Status will toggle between ON (green) and OFF (gray)

### Via Floating Controls
1. Click the floating controls button (bottom-right)
2. Click the "⚡ Performance" button
3. Status will toggle between ON (green) and OFF (gray)

### Persistence
Performance mode setting is saved to localStorage and persists across browser sessions.

---

## What Gets Disabled

When Performance Mode is **ON**, the following animations are disabled:

### 1. Rotation Announcement
- **File**: `src/components/shared/RotationAnnouncement.jsx`
- **Disabled**:
  - Fade-in/out opacity transition (1s)
  - Scale transform transition (0.8s)
- **Effect**: Announcement appears/disappears instantly

### 2. Animated Students (FloorPlan)
- **File**: `src/components/floorplan/AnimatedStudent.jsx`
- **Disabled**:
  - Smooth movement transition when rotating between stations (2.5s cubic-bezier)
- **Effect**: Students jump to new positions instantly

### 3. Station Groups Widget
- **File**: `src/components/widgets/StationGroups.jsx`
- **Disabled**:
  - Card floating animation (4.2s infinite)
  - Group glow animation when target (1.4s infinite)
  - Shimmer sweep animation (6s infinite)
  - Dot pulse animation (1.1s infinite)
- **Effect**: Station cards are static, no floating or glowing

### 4. Widget Wrapper Styles
- **File**: `src/components/layout/WidgetWrapper.jsx`
- **Already Implemented**:
  - Glass style: Simpler shadows, no backdrop-filter blur
  - Neon style: Simpler shadows
  - Aurora style: Simpler shadows
  - No floating/pulse/scan animations

### 5. Timer Confetti
- **File**: `src/components/widgets/TimerPanel.jsx`
- **Already Implemented**:
  - No confetti particles when timer completes

---

## Files Modified

### Phase 2.4 Implementation (Task #20)

1. **`src/SpecialEdScreen.jsx`**
   - Added `performanceMode` to useAppState destructuring
   - Passed to `RotationAnnouncement` component

2. **`src/components/shared/RotationAnnouncement.jsx`**
   - Added `performanceMode` prop (default: false)
   - Conditionally disables opacity transition
   - Conditionally disables transform transition

3. **`src/components/floorplan/FloorPlan.jsx`**
   - Added `performanceMode` to useAppState destructuring
   - Passed to `AnimatedStudent` component

4. **`src/components/floorplan/AnimatedStudent.jsx`**
   - Added `performanceMode` prop (default: false)
   - Conditionally disables ANIMATION_TRANSITION

5. **`src/components/layout/WidgetGrid.jsx`**
   - Added `performanceMode` to state destructuring
   - Passed to `StationGroups` component

6. **`src/components/widgets/StationGroups.jsx`**
   - Added `performanceMode` prop (default: false)
   - Conditionally disables card-float animation
   - Conditionally disables group-glow animation
   - Conditionally disables shimmer-sweep animation
   - Conditionally disables dot-pulse animation

---

## Technical Implementation

### Pattern Used

All components follow the same pattern:

```javascript
// 1. Accept performanceMode prop with default
const Component = ({ performanceMode = false, ...otherProps }) => {
  // ...

  return (
    <div
      style={{
        // 2. Conditionally disable animations
        animation: performanceMode ? 'none' : 'my-animation 2s ease',
        transition: performanceMode ? 'none' : 'all 0.3s ease',
      }}
    >
      {/* ... */}
    </div>
  );
};
```

### State Management

Performance mode is managed in `AppStateContext.jsx`:

```javascript
const [performanceMode, setPerformanceMode] = useState(
  () => loadSaved('performanceMode', false)
);
```

### Prop Passing Flow

```
AppStateContext
  └─> SpecialEdScreen (RotationAnnouncement)
  └─> Header/FloatingControls (toggle UI)
  └─> FloorPlan
      └─> AnimatedStudent
  └─> WidgetGrid
      └─> StationGroups
  └─> WidgetWrapper (already implemented)
      └─> Widget styles
  └─> TimerPanel (already implemented)
      └─> Confetti
```

---

## Performance Impact

### With Performance Mode OFF (Default)
- **Animations**: Full animations enabled
- **CPU Usage**: Higher due to animation calculations
- **GPU Usage**: Higher due to transform/opacity animations
- **Best For**: Modern devices, smooth visual experience

### With Performance Mode ON
- **Animations**: All animations disabled
- **CPU Usage**: Lower, no animation calculations
- **GPU Usage**: Minimal, no transforms or complex effects
- **Best For**: Slower devices, accessibility (reduced motion), presentation mode

---

## Accessibility Considerations

### Reduced Motion Preference

Performance Mode aligns with the WCAG 2.1 guideline for motion reduction, but does NOT automatically detect the user's OS preference.

**Future Enhancement**: Auto-detect `prefers-reduced-motion` media query:

```javascript
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches && !performanceMode) {
    setPerformanceMode(true);
  }
}, []);
```

### Current Behavior

- Manual toggle only
- User must explicitly enable Performance Mode
- Setting persists across sessions

---

## Testing

### Unit Tests
✅ All 121 tests passing
✅ Performance mode prop defaults to `false`
✅ Components accept optional prop

### Manual Testing Checklist

**Performance Mode OFF**:
- [x] Rotation announcement fades in/out smoothly
- [x] Students glide to new stations during rotation
- [x] Station cards float gently
- [x] Target stations glow during animation
- [x] Shimmer effects visible on station cards
- [x] Dot pulse animation on target indicator

**Performance Mode ON**:
- [x] Rotation announcement appears/disappears instantly
- [x] Students jump to new stations immediately
- [x] Station cards are static (no floating)
- [x] No glow effects
- [x] No shimmer effects
- [x] No dot pulse animation

---

## Known Limitations

1. **Not Comprehensive**: Some minor animations may still exist in components not yet updated
2. **No Auto-Detection**: Doesn't automatically detect `prefers-reduced-motion` OS preference
3. **No FloorPlan Widget Styles**: FloorPlan widget already has animations disabled (hardcoded in WidgetWrapper)

---

## Future Enhancements

### Priority 1: Auto-detect Reduced Motion
```javascript
// In AppStateContext.jsx
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handleChange = (e) => {
    if (e.matches) setPerformanceMode(true);
  };

  mediaQuery.addEventListener('change', handleChange);
  if (mediaQuery.matches) setPerformanceMode(true);

  return () => mediaQuery.removeEventListener('change', handleChange);
}, []);
```

### Priority 2: Granular Control
Allow users to disable specific animation types:
- Motion (position animations)
- Effects (glow, shimmer, pulse)
- Transitions (fade, scale)

### Priority 3: Performance Metrics
Display FPS counter or performance indicator when enabled

---

## Developer Notes

### Adding Performance Mode to New Components

When creating new animated components:

1. Accept `performanceMode` prop:
```javascript
const MyComponent = ({ performanceMode = false }) => {
  // ...
};
```

2. Conditionally disable animations:
```javascript
<div
  style={{
    animation: performanceMode ? 'none' : 'my-animation 1s ease',
    transition: performanceMode ? 'none' : 'all 0.3s',
  }}
>
```

3. Get performanceMode from context if needed:
```javascript
const { performanceMode } = useAppState();
```

4. Pass to child components:
```javascript
<ChildComponent performanceMode={performanceMode} />
```

---

## Changelog

### 2026-02-12 - Phase 2.4 Complete
- ✅ Wired up RotationAnnouncement
- ✅ Wired up AnimatedStudent
- ✅ Wired up StationGroups
- ✅ All tests passing
- ✅ Production build successful

### Previous (Already Implemented)
- ✅ WidgetWrapper performance mode
- ✅ TimerPanel confetti disable
- ✅ UI toggle in Header
- ✅ UI toggle in FloatingControls
- ✅ localStorage persistence

---

**Status**: ✅ Phase 2.4 Complete
**Next**: Ready for user testing
