// Utility to get the next upcoming festival date from FestivalDates.json
import festivalDates from "../json/FestivalDates.json";

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
