/**
 * Unified Button Style System
 * Consistent button styling across the entire application
 */

// Base button styles
const baseBtn =
  'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

// Size variants
export const buttonSizes = {
  xs: 'px-2 py-1 text-[10px] rounded',
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
};

// Style variants
export const buttonVariants = {
  // Primary - main actions
  primary: `${baseBtn} bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 shadow-sm hover:shadow-md`,

  // Secondary - alternative actions
  secondary: `${baseBtn} bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-400 border border-gray-300`,

  // Success - positive actions
  success: `${baseBtn} bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500 shadow-sm hover:shadow-md`,

  // Danger - destructive actions
  danger: `${baseBtn} bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm hover:shadow-md`,

  // Ghost - subtle actions
  ghost: `${baseBtn} bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400`,

  // Outline - bordered actions
  outline: `${baseBtn} bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 border-2 border-gray-300 hover:border-gray-400 focus:ring-gray-400`,
};

// Pill button styles (compact, rounded-full)
export const pillButton = {
  base: 'px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200',
  default: 'bg-black/10 hover:bg-black/20 text-gray-700 active:bg-black/30',
  active: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
};

// Icon button styles
export const iconButton = {
  sm: `${baseBtn} w-6 h-6 flex items-center justify-center rounded text-xs`,
  md: `${baseBtn} w-8 h-8 flex items-center justify-center rounded-lg text-sm`,
  lg: `${baseBtn} w-10 h-10 flex items-center justify-center rounded-lg text-base`,
};

// Menu item button (for dropdowns/modals)
export const menuButton =
  'w-full text-left px-3 py-2 text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors rounded-md';

// Helper function to combine button classes
export const getButtonClass = (variant = 'secondary', size = 'md') => {
  return `${buttonVariants[variant]} ${buttonSizes[size]}`;
};

// Helper for pill buttons
export const getPillClass = (state = 'default') => {
  return `${pillButton.base} ${pillButton[state]}`;
};

// Helper for icon buttons
export const getIconButtonClass = (size = 'md', variant = 'ghost') => {
  return `${iconButton[size]} ${buttonVariants[variant]}`;
};
