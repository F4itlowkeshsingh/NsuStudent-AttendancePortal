import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance } from "date-fns";

/**
 * Combines class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date as a relative time (e.g., "Today", "Yesterday", "2 days ago")
 */
export function formatRelativeDate(date: Date | string): string {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Reset hours for comparing just the date
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Convert input date to just the date part
  const inputDateOnly = new Date(
    inputDate.getFullYear(), 
    inputDate.getMonth(), 
    inputDate.getDate()
  );
  
  if (inputDateOnly.getTime() === today.getTime()) {
    return `Today at ${format(inputDate, 'h:mm a')}`;
  } else if (inputDateOnly.getTime() === yesterday.getTime()) {
    return `Yesterday at ${format(inputDate, 'h:mm a')}`;
  } else {
    // Check if it's within the last week
    const daysDiff = Math.floor((today.getTime() - inputDateOnly.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 7) {
      return formatDistance(inputDateOnly, today, { addSuffix: true });
    } else {
      return format(inputDate, 'MMM d, yyyy');
    }
  }
}

/**
 * Calculates the percentage of present students
 */
export function calculateAttendancePercentage(present: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

/**
 * Generate a color based on attendance percentage
 */
export function getAttendanceStatusColor(percentage: number): string {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 75) return 'text-amber-500';
  return 'text-red-500';
}
