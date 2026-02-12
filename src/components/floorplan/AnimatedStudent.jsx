import React, { useMemo } from 'react';

// Visual constants
const AVATAR_COLORS = ['#FF8A7A', '#5BC0BE', '#7BC47F', '#FFD166', '#B39DDB'];
const ANIMATION_TRANSITION = 'all 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)';

// Layout constants - these control how students are sized/positioned within stations
const BASE_DIMENSION = 80;           // Reference dimension for scale calculations (px)
const AVATAR_SLOT_RATIO = 0.75;      // Avatar takes 75% of slot height (vertical layout)
const AVATAR_WIDTH_RATIO = 0.45;     // Avatar max 45% of station width
const AVATAR_SLOT_WIDTH_RATIO = 0.8; // Avatar takes 80% of slot width (horizontal layout)
const AVATAR_HEIGHT_RATIO = 0.55;    // Avatar max 55% of available height
const NAME_SIZE_RATIO = 0.35;        // Name font = 35% of avatar size
const EMOJI_SIZE_RATIO = 0.55;       // Emoji font = 55% of avatar size
const CHAR_WIDTH_RATIO = 0.65;       // Estimated character width as ratio of font size
const MIN_AVATAR_SIZE = 6;           // Minimum avatar size (px)
const MIN_NAME_SIZE = 4;             // Minimum name font size (px)
const MIN_VISIBLE_NAME_SIZE = 5;     // Hide name below this size (px)

const AnimatedStudent = ({ studentId, name, photo, emoji, stationConfigs, currentGroup, targetGroup, isAnimating, index, groupSize, onClick, isEditMode, isLayoutEditMode, onDragStart, onDragEnd, isDragging }) => {
  const initials = useMemo(() => name.split(' ').map(n => n[0]).join('').toUpperCase(), [name]);
  const firstName = useMemo(() => name.split(' ')[0], [name]);
  const bgColor = AVATAR_COLORS[name.charCodeAt(0) % 5];
  const group = isAnimating ? targetGroup : currentGroup;
  const config = stationConfigs[group];
  if (!config || config.width <= 0 || config.height <= 0) return null;
  const isVertical = config.height > config.width;

  const headerScale = Math.max(0.15, Math.min(1.2, Math.min(config.width, config.height) / BASE_DIMENSION));
  const headerHeight = Math.max(6, 20 * headerScale);

  let avatarSize, nameSize;

  if (isVertical) {
    const availHeight = config.height - headerHeight;
    const availWidth = config.width;
    const slotH = availHeight / Math.max(1, groupSize);
    avatarSize = Math.max(MIN_AVATAR_SIZE, Math.min(slotH * AVATAR_SLOT_RATIO, availWidth * AVATAR_WIDTH_RATIO));
    nameSize = Math.max(MIN_NAME_SIZE, avatarSize * NAME_SIZE_RATIO);
  } else {
    const availWidth = config.width;
    const availHeight = config.height - headerHeight;
    const slotW = availWidth / Math.max(1, groupSize);
    // Fit avatar within the slot, but also leave room for the name label.
    // Estimate name width ≈ charCount × fontSize × charWidthRatio, then cap avatar so
    // the wider of (avatar, nameWidth) doesn't exceed the slot.
    const rawAvatar = Math.min(slotW * AVATAR_SLOT_WIDTH_RATIO, availHeight * AVATAR_HEIGHT_RATIO);
    const rawNameSize = Math.max(MIN_NAME_SIZE, rawAvatar * NAME_SIZE_RATIO);
    const estNameWidth = firstName.length * rawNameSize * CHAR_WIDTH_RATIO;
    // If the name would be wider than the avatar, shrink both to fit the slot
    const widestItem = Math.max(rawAvatar, estNameWidth);
    if (widestItem > slotW) {
      const shrink = slotW / widestItem;
      avatarSize = Math.max(MIN_AVATAR_SIZE, rawAvatar * shrink);
      nameSize = Math.max(MIN_NAME_SIZE, avatarSize * NAME_SIZE_RATIO);
    } else {
      avatarSize = Math.max(MIN_AVATAR_SIZE, rawAvatar);
      nameSize = rawNameSize;
    }
  }

  const avatarScaleMultiplier = config.avatarScale || 1.0;
  avatarSize *= avatarScaleMultiplier;
  nameSize *= avatarScaleMultiplier;

  const showName = nameSize >= MIN_VISIBLE_NAME_SIZE;

  // Estimate rendered name width for spacing purposes
  const estNameLabelWidth = showName ? firstName.length * nameSize * CHAR_WIDTH_RATIO : 0;
  // Item width is the wider of avatar circle or name label, plus a small gap
  const itemWidth = Math.max(avatarSize, estNameLabelWidth) + 4;
  const itemHeight = avatarSize + (showName ? nameSize + 2 : 0);

  let left, top;
  if (isVertical) {
    const availHeight = config.height - headerHeight;
    const nameEstWidth = showName ? firstName.length * nameSize * CHAR_WIDTH_RATIO : 0;
    const rowWidth = avatarSize + (showName ? nameEstWidth + 4 : 0);
    const spacing = Math.min(itemHeight + 1, availHeight / groupSize);
    const totalHeight = groupSize * spacing;
    const bodyTop = config.top + headerHeight;
    const startY = bodyTop + (availHeight - totalHeight) / 2;
    left = config.left + (config.width / 2) - (rowWidth / 2);
    top = startY + (index * spacing);
  } else {
    const availWidth = config.width;
    const spacing = Math.min(itemWidth, availWidth / groupSize);
    const totalWidth = groupSize * spacing;
    const startX = config.left + (availWidth - totalWidth) / 2;
    const bodyTop = config.top + headerHeight;
    const bodyHeight = config.height - headerHeight;
    const itemTotalHeight = avatarSize + (showName ? nameSize + 4 : 0);
    left = startX + (index * spacing);
    top = bodyTop + (bodyHeight - itemTotalHeight) / 2;
  }

  const borderWidth = avatarSize > 14 ? 2 : avatarSize > 8 ? 1 : 0;
  const shadow = isAnimating
    ? `0 ${Math.max(1, avatarSize * 0.1)}px ${Math.max(2, avatarSize * 0.4)}px ${bgColor}80`
    : `0 ${Math.max(1, avatarSize * 0.05)}px ${Math.max(1, avatarSize * 0.15)}px rgba(0,0,0,0.15)`;

  const avatarEl = photo ? (
    <img src={photo} alt={name} className="rounded-full object-cover flex-shrink-0"
      style={{ width: avatarSize, height: avatarSize }} />
  ) : emoji ? (
    <div className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: avatarSize, height: avatarSize, fontSize: avatarSize * EMOJI_SIZE_RATIO,
        backgroundColor: isEditMode ? bgColor : 'transparent',
        borderWidth: isEditMode ? borderWidth : 0, borderColor: 'white', borderStyle: 'solid',
        boxShadow: isEditMode ? shadow : 'none' }}>
      {emoji}
    </div>
  ) : (
    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: avatarSize, height: avatarSize, fontSize: Math.max(4, avatarSize * 0.4), backgroundColor: bgColor, boxShadow: shadow }}>
      {initials}
    </div>
  );

  const nameEl = showName ? (
    <span className="font-medium text-gray-700 whitespace-nowrap" style={{ fontSize: nameSize, lineHeight: 1 }}>
      {firstName}
    </span>
  ) : null;

  // Determine if this student can be dragged
  const canDrag = !isEditMode && !isAnimating && !isLayoutEditMode;

  // Handle drag start
  const handleDragStart = (e) => {
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    e.stopPropagation(); // Prevent widget drag handlers from interfering
    // Set a transparent drag image (we'll show feedback via opacity)
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(img, 0, 0);
    onDragStart?.(studentId);
  };

  const handleDragEnd = (e) => {
    e.stopPropagation(); // Prevent widget drag handlers from interfering
    onDragEnd?.();
  };

  return (
    <div
      className={`absolute ${!isEditMode && !isAnimating ? 'cursor-grab active:cursor-grabbing' : isEditMode ? '' : 'cursor-pointer'} ${isVertical ? 'flex items-center gap-0.5' : 'flex flex-col items-center gap-0'}`}
      style={{
        top,
        left,
        transition: isDragging ? 'none' : ANIMATION_TRANSITION,
        zIndex: isAnimating ? 20 : 10,
        opacity: isEditMode ? 0.5 : isDragging ? 0.4 : 1,
        pointerEvents: isEditMode ? 'none' : 'auto',
        transform: isDragging ? 'scale(1.1)' : 'scale(1)'
      }}
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}>
      {avatarEl}
      {nameEl}
    </div>
  );
};

export default AnimatedStudent;
