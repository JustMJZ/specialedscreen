import React from 'react';

/**
 * EmptyState component for displaying empty/placeholder content
 * @param {string} icon - Emoji or icon to display
 * @param {string} title - Main message
 * @param {string} description - Optional secondary message
 * @param {React.ReactNode} action - Optional action button/element
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 */
const EmptyState = ({
  icon = '📦',
  title = 'No content yet',
  description = '',
  action = null,
  size = 'md'
}) => {
  const sizes = {
    sm: {
      container: 'py-4',
      icon: 'text-3xl',
      title: 'text-sm',
      description: 'text-xs'
    },
    md: {
      container: 'py-8',
      icon: 'text-5xl',
      title: 'text-base',
      description: 'text-sm'
    },
    lg: {
      container: 'py-12',
      icon: 'text-6xl',
      title: 'text-lg',
      description: 'text-base'
    }
  };

  const sizeClasses = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeClasses.container}`}>
      <div className={`${sizeClasses.icon} mb-3 opacity-40`}>
        {icon}
      </div>
      <div className={`${sizeClasses.title} font-semibold text-gray-700 mb-1`}>
        {title}
      </div>
      {description && (
        <div className={`${sizeClasses.description} text-gray-500 max-w-xs`}>
          {description}
        </div>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
