/**
 * Unified Input Style System
 * Consistent form control styling across the entire application
 */

// Base input styles
const baseInput =
  'transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border';

// Input sizes
export const inputSizes = {
  sm: 'px-2 py-1 text-xs rounded-md',
  md: 'px-3 py-2 text-sm rounded-lg',
  lg: 'px-4 py-3 text-base rounded-lg',
};

// Input variants
export const inputVariants = {
  // Default input
  default: `${baseInput} bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`,

  // Filled background variant
  filled: `${baseInput} bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`,

  // Error state
  error: `${baseInput} bg-white border-red-300 text-gray-900 placeholder-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20`,

  // Success state
  success: `${baseInput} bg-white border-green-300 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20`,
};

// Textarea styles (extends input styles)
export const textareaVariants = {
  default: `${inputVariants.default} resize-none`,
  filled: `${inputVariants.filled} resize-none`,
};

// Select/dropdown styles
export const selectVariants = {
  default: `${inputVariants.default} cursor-pointer`,
  filled: `${inputVariants.filled} cursor-pointer`,
};

// Label styles
export const labelStyles = {
  default: 'block text-sm font-medium text-gray-700 mb-1.5',
  required:
    "block text-sm font-medium text-gray-700 mb-1.5 after:content-['*'] after:ml-0.5 after:text-red-500",
};

// Helper functions
export const getInputClass = (variant = 'default', size = 'md') => {
  return `${inputVariants[variant]} ${inputSizes[size]}`;
};

export const getTextareaClass = (variant = 'default', size = 'md') => {
  return `${textareaVariants[variant]} ${inputSizes[size]}`;
};

export const getSelectClass = (variant = 'default', size = 'md') => {
  return `${selectVariants[variant]} ${inputSizes[size]}`;
};
