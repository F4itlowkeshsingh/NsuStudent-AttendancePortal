import { 
  users, type User, type InsertUser,
  classes, type Class, type InsertClass, type ClassWithStudentCount,
  students, type Student, type InsertStudent,
  attendance, type Attendance, type InsertAttendance,
  type StudentWithAttendance, type AttendanceSummary, type DashboardStats
} from "@shared/schema";
import { format } from "date-fns";
import { db } from "./db";
import { eq, and, desc, count, gte, lte, sql } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods (from existing code)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Class methods
  getClasses(): Promise<ClassWithStudentCount[]>;
  getClass(id: number): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined>;
  deleteClass(id: number): Promise<boolean>;
  
  // Student methods
  getStudents(): Promise<Student[]>;
  getStudentsByClass(classId: number): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByRollNo(rollNo: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  
  // Attendance methods
  getAttendanceByDate(classId: number, date: string): Promise<StudentWithAttendance[]>;
  saveAttendance(attendanceRecords: InsertAttendance[]): Promise<void>;
  getAttendanceReport(classId: number, startDate?: string, endDate?: string): Promise<Attendance[]>;
  getAttendanceSummary(classId: number, date: string): Promise<AttendanceSummary>;
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  // User methods implementation
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Class methods implementation
  async getClasses(): Promise<ClassWithStudentCount[]> {
    // Get all classes
    const classList = await db.select().from(classes);
    
    // For each class, get student count and last attendance update
    const result: ClassWithStudentCount[] = [];
    
    for (const cls of classList) {
      // Count students in this class
      const [{ value: studentCount }] = await db
        .select({ value: count() })
        .from(students)
        .where(eq(students.classId, cls.id));
      
      // Get the latest attendance record for this class
      const [latestAttendance] = await db
        .select()
        .from(attendance)
        .where(eq(attendance.classId, cls.id))
        .orderBy(desc(attendance.date), desc(attendance.createdAt))
        .limit(1);
      
      let lastUpdated: string | undefined;
      if (latestAttendance) {
        // Format the date as a relative time or actual date
        const recordDate = new Date(latestAttendance.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (recordDate.getTime() === today.getTime()) {
          lastUpdated = `Today at ${format(latestAttendance.createdAt, 'h:mm a')}`;
        } else if (recordDate.getTime() === yesterday.getTime()) {
          lastUpdated = `Yesterday at ${format(latestAttendance.createdAt, 'h:mm a')}`;
        } else {
          lastUpdated = format(recordDate, 'MMM d, yyyy');
        }
      }
      
      result.push({
        ...cls,
        studentCount,
        lastUpdated
      });
    }
    
    return result;
  }

  async getClass(id: number): Promise<Class | undefined> {
    const [cls] = await db.select().from(classes).where(eq(classes.id, id));
    return cls || undefined;
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [newClass] = await db
      .insert(classes)
      .values(classData)
      .returning();
    return newClass;
  }

  async updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined> {
    const [updatedClass] = await db
      .update(classes)
      .set(classData)
      .where(eq(classes.id, id))
      .returning();
    return updatedClass || undefined;
  }

  async deleteClass(id: number): Promise<boolean> {
    try {
      // Check if there are students in this class first
      const [{ count: studentCount }] = await db
        .select({ count: count() })
        .from(students)
        .where(eq(students.classId, id));
      
      if (studentCount > 0) {
        // Cannot delete class with students
        return false;
      }
      
      // Check if there are attendance records for this class
      const [{ count: attendanceCount }] = await db
        .select({ count: count() })
        .from(attendance)
        .where(eq(attendance.classId, id));
      
      if (attendanceCount > 0) {
        // Cannot delete class with attendance records
        return false;
      }
      
      // Delete the class if no dependencies
      await db
        .delete(classes)
        .where(eq(classes.id, id));
      
      return true;
    } catch (error) {
      console.error("Error deleting class:", error);
      return false;
    }
  }

  // Student methods implementation
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getStudentsByClass(classId: number): Promise<Student[]> {
    return await db
      .select()
      .from(students)
      .where(eq(students.classId, classId));
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, id));
    return student || undefined;
  }

  async getStudentByRollNo(rollNo: string): Promise<Student | undefined> {
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.rollNo, rollNo));
    return student || undefined;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db
      .insert(students)
      .values(student)
      .returning();
    return newStudent;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined> {
    const [updatedStudent] = await db
      .update(students)
      .set(studentData)
      .where(eq(students.id, id))
      .returning();
    return updatedStudent || undefined;
  }

  async deleteStudent(id: number): Promise<boolean> {
    try {
      // Check if there are attendance records for this student
      const [{ count: attendanceCount }] = await db
        .select({ count: count() })
        .from(attendance)
        .where(eq(attendance.studentId, id));
      
      if (attendanceCount > 0) {
        // Cannot delete student with attendance records
        return false;
      }
      
      // Delete the student if no dependencies
      await db
        .delete(students)
        .where(eq(students.id, id));
      
      return true;
    } catch (error) {
      console.error("Error deleting student:", error);
      return false;
    }
  }

  // Attendance methods implementation
  async getAttendanceByDate(classId: number, date: string): Promise<StudentWithAttendance[]> {
    // Get all students in the class
    const studentsList = await this.getStudentsByClass(classId);
    
    // Get attendance records for the specified date and class
    const attendanceRecords = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.classId, classId),
          eq(attendance.date, date)
        )
      );
    
    // Map students with their attendance status
    return studentsList.map(student => {
      const record = attendanceRecords.find(record => record.studentId === student.id);
      return {
        ...student,
        isPresent: record ? record.isPresent : undefined
      };
    });
  }

  async saveAttendance(attendanceRecords: InsertAttendance[]): Promise<void> {
    // Insert all attendance records in a transaction
    if (attendanceRecords.length === 0) return;
    
    await db.insert(attendance).values(attendanceRecords);
  }

  async getAttendanceReport(classId: number, startDate?: string, endDate?: string): Promise<Attendance[]> {
    let conditions = [eq(attendance.classId, classId)];
    
    if (startDate) {
      conditions.push(gte(attendance.date, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(attendance.date, endDate));
    }
    
    return await db
      .select()
      .from(attendance)
      .where(and(...conditions));
  }

  async getAttendanceSummary(classId: number, date: string): Promise<AttendanceSummary> {
    // Get all attendance records for the class and date
    const records = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.classId, classId),
          eq(attendance.date, date)
        )
      );
    
    const present = records.filter(record => record.isPresent).length;
    const total = records.length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return {
      date,
      present,
      absent,
      total,
      percentage
    };
  }

  async getDashboardStats(): Promise<DashboardStats> {
    // Count total classes
    const [{ value: totalClasses }] = await db
      .select({ value: count() })
      .from(classes);
    
    // Count total students
    const [{ value: totalStudents }] = await db
      .select({ value: count() })
      .from(students);
    
    // Calculate today's attendance percentage
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = await db
      .select()
      .from(attendance)
      .where(eq(attendance.date, today));
    
    const presentToday = todayRecords.filter(record => record.isPresent).length;
    const todayAttendance = todayRecords.length > 0 
      ? Math.round((presentToday / todayRecords.length) * 100) 
      : 0;
    
    // Count the number of unique dates for attendance records (reports generated)
    const result = await db
      .select({ date: attendance.date })
      .from(attendance)
      .groupBy(attendance.date);
    
    const reportsGenerated = result.length;
    
    return {
      totalClasses,
      totalStudents,
      todayAttendance,
      reportsGenerated
    };
  }
}

export const storage = new DatabaseStorage();
