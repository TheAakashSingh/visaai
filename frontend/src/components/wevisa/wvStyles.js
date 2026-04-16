// src/components/wevisa/wvStyles.js — shared WeVisa light-theme style tokens
// Import these in every WeVisa page for consistent, visible inputs

export const WV = {
  // Inputs — always dark text on light background
  input: [
    'w-full px-4 py-3 rounded-xl border border-gray-200',
    'text-gray-800 text-sm bg-gray-50 placeholder:text-gray-400',
    'focus:outline-none focus:border-blue-500 focus:bg-white',
    'transition-colors duration-200',
  ].join(' '),

  inputSm: [
    'w-full px-3 py-2.5 rounded-xl border border-gray-200',
    'text-gray-800 text-sm bg-gray-50 placeholder:text-gray-400',
    'focus:outline-none focus:border-blue-500 focus:bg-white',
    'transition-colors duration-200',
  ].join(' '),

  select: [
    'w-full px-4 py-3 rounded-xl border border-gray-200',
    'text-gray-800 text-sm bg-gray-50',
    'focus:outline-none focus:border-blue-500 focus:bg-white',
    'transition-colors duration-200 cursor-pointer',
  ].join(' '),

  selectSm: [
    'w-full px-3 py-2.5 rounded-xl border border-gray-200',
    'text-gray-800 text-sm bg-gray-50',
    'focus:outline-none focus:border-blue-500 focus:bg-white',
    'transition-colors duration-200 cursor-pointer',
  ].join(' '),

  textarea: [
    'w-full px-4 py-3 rounded-xl border border-gray-200',
    'text-gray-800 text-sm bg-gray-50 placeholder:text-gray-400',
    'focus:outline-none focus:border-blue-500 focus:bg-white',
    'transition-colors duration-200 resize-none',
  ].join(' '),

  label: 'block text-xs font-bold text-gray-600 mb-1.5',

  // Buttons
  btnPrimary: 'px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow cursor-pointer border-0 flex items-center gap-2',
  btnDanger:  'px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow cursor-pointer border-0',
  btnOutline: 'px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:border-blue-400 hover:text-blue-600 transition-all cursor-pointer bg-white',

  // Cards
  card: 'bg-white rounded-2xl border border-gray-100 shadow-sm',
  cardHover: 'bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all',
}

// Inline style override — force text visible in any context
export const inlineInput = { color: '#1f2937', backgroundColor: '#f9fafb' }
export const inlineInputFocus = { color: '#1f2937', backgroundColor: '#ffffff' }
