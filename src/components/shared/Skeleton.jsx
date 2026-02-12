import React from 'react';

/**
 * Skeleton loading component for content placeholders
 * @param {string} variant - Shape variant: 'text', 'rect', 'circle'
 * @param {string} width - Custom width (e.g., '100%', '200px')
 * @param {string} height - Custom height (e.g., '20px', '100px')
 * @param {string} className - Additional classes
 */
const Skeleton = ({ variant = 'rect', width, height, className = '' }) => {
  const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]';

  const variants = {
    text: 'h-4 rounded',
    rect: 'h-20 rounded-lg',
    circle: 'rounded-full aspect-square'
  };

  const style = {
    width: width || (variant === 'circle' ? height : undefined),
    height: height
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div
        className={`${baseClasses} ${variants[variant]} ${className}`}
        style={style}
        aria-hidden="true"
      />
    </>
  );
};

/**
 * Pre-built skeleton patterns
 */
export const SkeletonText = ({ lines = 3, ...props }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? '80%' : '100%'}
        {...props}
      />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="p-4 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton variant="circle" height="48px" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <SkeletonText lines={2} />
  </div>
);

export default Skeleton;
