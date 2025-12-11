// helper.js - Central place for utility functions

/**
 * Get environment variable value with fallback (Laravel-style)
 * @param {string} key - The environment variable key
 * @param {any} fallback - The fallback value if not set
 * @returns {string|any}
 */
export function env(key, fallback = undefined) {
  if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
    // Remove quotes if present (for .env values like 'value' or "value")
    return process.env[key].replace(/^['"]|['"]$/g, '');
  }
  return fallback;
}


import festivalDates from "../json/FestivalDates.json";

/**
 * Get the next upcoming festival date from FestivalDates.json
 * @param {string} festivalSlug
 * @returns {string|null}
 */
export function getUpcomingFestivalDate(festivalSlug) {
  const dates = festivalDates[festivalSlug];
  if (!dates || !Array.isArray(dates)) return null;
  const today = new Date();
  for (const dateStr of dates) {
    const date = new Date(dateStr);
    if (date >= today) {
      return dateStr;
    }
  }
  // If all dates are in the past, return the last one
  return dates[dates.length - 1] || null;
}
