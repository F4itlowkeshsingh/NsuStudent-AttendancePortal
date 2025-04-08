import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClassSchema, 
  insertStudentSchema, 
  insertAttendanceSchema 
} from "@shared/schema";
import { format } from "date-fns";
import ExcelJS from "exceljs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Class routes
  app.get("/api/classes", async (req: Request, res: Response) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.get("/api/classes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const cls = await storage.getClass(id);
      
      if (!cls) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      res.json(cls);
    } catch (error) {
      console.error("Error fetching class:", error);
      res.status(500).json({ message: "Failed to fetch class details" });
    }
  });

  app.post("/api/classes", async (req: Request, res: Response) => {
    try {
      const validatedData = insertClassSchema.parse(req.body);
      const newClass = await storage.createClass(validatedData);
      res.status(201).json(newClass);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(400).json({ message: "Failed to create class" });
    }
  });

  // Student routes
  app.get("/api/students", async (req: Request, res: Response) => {
    try {
      const classId = req.query.classId ? parseInt(req.query.classId as string) : undefined;
      
      let students;
      if (classId) {
        students = await storage.getStudentsByClass(classId);
      } else {
        students = await storage.getStudents();
      }
      
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/students", async (req: Request, res: Response) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      
      // Check if roll number already exists
      const existingStudent = await storage.getStudentByRollNo(validatedData.rollNo);
      if (existingStudent) {
        return res.status(400).json({ message: "Student with this roll number already exists" });
      }
      
      const newStudent = await storage.createStudent(validatedData);
      res.status(201).json(newStudent);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(400).json({ message: "Failed to create student" });
    }
  });

  // Attendance routes
  app.get("/api/attendance", async (req: Request, res: Response) => {
    try {
      const classId = parseInt(req.query.classId as string);
      const date = req.query.date as string;
      
      if (!classId || !date) {
        return res.status(400).json({ message: "Class ID and date are required" });
      }
      
      const studentsWithAttendance = await storage.getAttendanceByDate(classId, date);
      res.json(studentsWithAttendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance data" });
    }
  });

  app.post("/api/attendance", async (req: Request, res: Response) => {
    try {
      const { classId, date, subject, timeSlot, attendanceData } = req.body;
      
      if (!classId || !date || !attendanceData || !Array.isArray(attendanceData)) {
        return res.status(400).json({ message: "Invalid attendance data format" });
      }
      
      const attendanceRecords = attendanceData.map(item => ({
        studentId: item.studentId,
        classId,
        date,
        isPresent: item.isPresent,
        subject,
        timeSlot
      }));
      
      // Validate all records
      attendanceRecords.forEach(record => {
        insertAttendanceSchema.parse(record);
      });
      
      await storage.saveAttendance(attendanceRecords);
      res.status(201).json({ message: "Attendance saved successfully" });
    } catch (error) {
      console.error("Error saving attendance:", error);
      res.status(400).json({ message: "Failed to save attendance data" });
    }
  });

  app.get("/api/attendance/summary", async (req: Request, res: Response) => {
    try {
      const classId = parseInt(req.query.classId as string);
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      
      if (!classId) {
        return res.status(400).json({ message: "Class ID is required" });
      }
      
      const summary = await storage.getAttendanceSummary(classId, date);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching attendance summary:", error);
      res.status(500).json({ message: "Failed to fetch attendance summary" });
    }
  });

  // Excel export route
  app.get("/api/export/attendance", async (req: Request, res: Response) => {
    try {
      const classId = parseInt(req.query.classId as string);
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      if (!classId) {
        return res.status(400).json({ message: "Class ID is required" });
      }
      
      // Get class details
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      // Get students in the class
      const students = await storage.getStudentsByClass(classId);
      
      // Get attendance records
      const attendanceRecords = await storage.getAttendanceReport(classId, startDate, endDate);
      
      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Netaji Subhash University";
      workbook.created = new Date();
      
      // Limit worksheet name to 31 characters (Excel limitation)
      const worksheetName = `${classData.name} Attendance`.substring(0, 31);
      const worksheet = workbook.addWorksheet(worksheetName);
      
      // Define all columns at once to avoid the equivalentTo issue
      const columns = [
        { header: 'Roll No', key: 'rollNo', width: 15 },
        { header: 'Student Name', key: 'name', width: 30 },
        { header: 'Registration No', key: 'registrationNo', width: 20 }
      ];
      
      // Get unique dates from attendance records using a Map for uniqueness
      const uniqueDates: Record<string, boolean> = {};
      attendanceRecords.forEach(record => {
        uniqueDates[record.date] = true;
      });
      const dates = Object.keys(uniqueDates).sort();
      
      // Add date columns
      dates.forEach(date => {
        const formattedDate = format(new Date(date), 'dd/MM/yyyy');
        columns.push({ 
          header: formattedDate, 
          key: `attendance_${date}`, 
          width: 12 
        });
      });
      
      // Add total present and percentage columns
      columns.push(
        { header: 'Total Present', key: 'totalPresent', width: 15 },
        { header: 'Percentage', key: 'percentage', width: 15 }
      );
      
      // Set all columns at once
      worksheet.columns = columns;
      
      // Add student data
      students.forEach(student => {
        const row: any = {
          rollNo: student.rollNo,
          name: student.name,
          registrationNo: student.registrationNo || 'N/A'
        };
        
        // Add attendance for each date
        let totalPresent = 0;
        dates.forEach(date => {
          const record = attendanceRecords.find(
            r => r.studentId === student.id && r.date === date
          );
          
          const status = record ? (record.isPresent ? 'Present' : 'Absent') : 'N/A';
          row[`attendance_${date}`] = status;
          
          if (record && record.isPresent) {
            totalPresent++;
          }
        });
        
        // Calculate percentage
        const percentage = dates.length > 0 
          ? ((totalPresent / dates.length) * 100).toFixed(2) + '%'
          : 'N/A';
        
        row.totalPresent = totalPresent;
        row.percentage = percentage;
        
        worksheet.addRow(row);
      });
      
      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
      
      // Style the cells
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          row.eachCell((cell, colNumber) => {
            if (colNumber > 3 && colNumber <= 3 + dates.length) {
              // Attendance status cells
              if (cell.value === 'Present') {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFE2F0D9' } // Light green
                };
              } else if (cell.value === 'Absent') {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFD9D9' } // Light red
                };
              }
            }
            
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            
            // Border
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        }
      });
      
      // Set filename
      const fileName = `${classData.name.replace(/\s+/g, '_')}_Attendance_Report.xlsx`;
      
      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      // Write workbook to response
      await workbook.xlsx.write(res);
      res.end();
      
    } catch (error) {
      console.error("Error exporting attendance:", error);
      res.status(500).json({ message: "Failed to export attendance data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
