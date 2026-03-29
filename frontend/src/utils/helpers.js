import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';

export const formatDate = (date) => format(new Date(date), 'MMMM d, yyyy');
export const formatTime = (date) => format(new Date(date), 'h:mm a');
export const formatDateTime = (date) => format(new Date(date), 'MMM d, yyyy · h:mm a');
export const formatShortDate = (date) => format(new Date(date), 'MMM d');
export const formatDayMonth = (date) => format(new Date(date), 'EEEE, MMMM d');
export const formatRelative = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });
export const isDatePast = (date) => isPast(new Date(date));

export const getDateLabel = (date) => {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'EEEE, MMMM d');
};

export const getDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const colorOptions = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#84cc16', label: 'Lime' },
  { value: '#f97316', label: 'Orange' },
];

export const timezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'Pacific/Honolulu', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Europe/Moscow', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Singapore',
  'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland'
];

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DURATION_OPTIONS = [15, 20, 30, 45, 60, 90, 120];

export const clsx = (...classes) => classes.filter(Boolean).join(' ');
