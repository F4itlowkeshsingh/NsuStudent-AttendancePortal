import { format } from 'date-fns';
import { Student, Attendance, Class } from '@shared/schema';

export interface ExportAttendanceParams {
  classData: Class;
  students: Student[];
  attendanceRecords: Attendance[];
  startDate: Date;
  endDate: Date;
}

/**
 * Helper function to prepare attendance data for export
 */
export function prepareAttendanceExportData(params: ExportAttendanceParams) {
  const { classData, students, attendanceRecords, startDate, endDate } = params;
  
  // Format dates for API URL
  const formattedStartDate = format(startDate, 'yyyy-MM-dd');
  const formattedEndDate = format(endDate, 'yyyy-MM-dd');
  
  // Generate export URL
  const exportUrl = `/api/export/attendance?classId=${classData.id}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
  
  return exportUrl;
}

/**
 * Open the export URL in a new window/tab to download the file
 */
export function downloadAttendanceReport(url: string): void {
  window.open(url, '_blank');
}
