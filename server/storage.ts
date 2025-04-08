import { 
  users, type User, type InsertUser,
  classes, type Class, type InsertClass, type ClassWithStudentCount,
  students, type Student, type InsertStudent,
  attendance, type Attendance, type InsertAttendance,
  type StudentWithAttendance, type AttendanceSummary, type DashboardStats
} from "@shared/schema";
import { format } from "date-fns";

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
  
  // Student methods
  getStudents(): Promise<Student[]>;
  getStudentsByClass(classId: number): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByRollNo(rollNo: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  
  // Attendance methods
  getAttendanceByDate(classId: number, date: string): Promise<StudentWithAttendance[]>;
  saveAttendance(attendanceRecords: InsertAttendance[]): Promise<void>;
  getAttendanceReport(classId: number, startDate?: string, endDate?: string): Promise<Attendance[]>;
  getAttendanceSummary(classId: number, date: string): Promise<AttendanceSummary>;
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private classesMap: Map<number, Class>;
  private studentsMap: Map<number, Student>;
  private attendanceMap: Map<number, Attendance>;
  private currentUserID: number;
  private currentClassID: number;
  private currentStudentID: number;
  private currentAttendanceID: number;

  constructor() {
    this.users = new Map();
    this.classesMap = new Map();
    this.studentsMap = new Map();
    this.attendanceMap = new Map();
    this.currentUserID = 1;
    this.currentClassID = 1;
    this.currentStudentID = 1;
    this.currentAttendanceID = 1;
    
    // Add some initial data for testing
    this.initializeTestData();
  }

  private initializeTestData() {
    // Add classes
    const classesList = [
      { name: "B.Tech Computer Science (4th Sem)", department: "Engineering", semester: 4 },
      { name: "M.Sc. Physics (2nd Sem)", department: "Science", semester: 2 },
      { name: "BBA (6th Sem)", department: "Business", semester: 6 },
      { name: "B.A. History (2nd Sem)", department: "Arts", semester: 2 }
    ];
    
    const classIDs: number[] = [];
    classesList.forEach(cls => {
      const newClass = this.createClass(cls);
      classIDs.push(newClass.id);
    });
    
    // Add students
    const studentsList = [
      { name: "Rahul Kumar", rollNo: "CS2001", classId: classIDs[0] },
      { name: "Priya Sharma", rollNo: "CS2002", classId: classIDs[0] },
      { name: "Amit Singh", rollNo: "CS2003", classId: classIDs[0] },
      { name: "Neha Gupta", rollNo: "CS2004", classId: classIDs[0] },
      { name: "Vikram Patel", rollNo: "CS2005", classId: classIDs[0] },
      { name: "Sunita Rao", rollNo: "PH2001", classId: classIDs[1] },
      { name: "Rajesh Verma", rollNo: "PH2002", classId: classIDs[1] }
    ];
    
    studentsList.forEach(student => {
      this.createStudent({
        ...student,
        registrationNo: `NSU/${new Date().getFullYear()}/${student.rollNo}`,
        email: `${student.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`
      });
    });
    
    // Add some attendance records
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Today's attendance
    this.saveAttendance([
      { studentId: 1, classId: classIDs[0], date: today, isPresent: true, subject: "Data Structures", timeSlot: "Morning" },
      { studentId: 2, classId: classIDs[0], date: today, isPresent: false, subject: "Data Structures", timeSlot: "Morning" },
      { studentId: 3, classId: classIDs[0], date: today, isPresent: true, subject: "Data Structures", timeSlot: "Morning" },
      { studentId: 4, classId: classIDs[0], date: today, isPresent: true, subject: "Data Structures", timeSlot: "Morning" },
      { studentId: 5, classId: classIDs[0], date: today, isPresent: false, subject: "Data Structures", timeSlot: "Morning" }
    ]);
    
    // Yesterday's attendance
    this.saveAttendance([
      { studentId: 1, classId: classIDs[0], date: yesterday, isPresent: true, subject: "Computer Networks", timeSlot: "Afternoon" },
      { studentId: 2, classId: classIDs[0], date: yesterday, isPresent: true, subject: "Computer Networks", timeSlot: "Afternoon" },
      { studentId: 3, classId: classIDs[0], date: yesterday, isPresent: true, subject: "Computer Networks", timeSlot: "Afternoon" },
      { studentId: 4, classId: classIDs[0], date: yesterday, isPresent: false, subject: "Computer Networks", timeSlot: "Afternoon" },
      { studentId: 5, classId: classIDs[0], date: yesterday, isPresent: true, subject: "Computer Networks", timeSlot: "Afternoon" }
    ]);
  }

  // User methods implementation
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserID++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Class methods implementation
  async getClasses(): Promise<ClassWithStudentCount[]> {
    const classes = Array.from(this.classesMap.values());
    
    // Calculate student count for each class
    return classes.map(cls => {
      const students = Array.from(this.studentsMap.values()).filter(
        student => student.classId === cls.id
      );
      
      // Find last attendance update for the class
      const attendanceRecords = Array.from(this.attendanceMap.values()).filter(
        record => record.classId === cls.id
      );
      
      let lastUpdated: string | undefined;
      if (attendanceRecords.length > 0) {
        const latestRecord = attendanceRecords.reduce((latest, current) => {
          return new Date(latest.date) > new Date(current.date) ? latest : current;
        });
        
        // Format the date as a relative time or actual date
        const recordDate = new Date(latestRecord.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (recordDate.getTime() === today.getTime()) {
          lastUpdated = `Today at ${format(latestRecord.createdAt, 'h:mm a')}`;
        } else if (recordDate.getTime() === yesterday.getTime()) {
          lastUpdated = `Yesterday at ${format(latestRecord.createdAt, 'h:mm a')}`;
        } else {
          lastUpdated = format(recordDate, 'MMM d, yyyy');
        }
      }
      
      return {
        ...cls,
        studentCount: students.length,
        lastUpdated
      };
    });
  }

  async getClass(id: number): Promise<Class | undefined> {
    return this.classesMap.get(id);
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const id = this.currentClassID++;
    const newClass: Class = { 
      ...classData, 
      id,
      createdAt: new Date()
    };
    this.classesMap.set(id, newClass);
    return newClass;
  }

  // Student methods implementation
  async getStudents(): Promise<Student[]> {
    return Array.from(this.studentsMap.values());
  }

  async getStudentsByClass(classId: number): Promise<Student[]> {
    return Array.from(this.studentsMap.values()).filter(
      student => student.classId === classId
    );
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.studentsMap.get(id);
  }

  async getStudentByRollNo(rollNo: string): Promise<Student | undefined> {
    return Array.from(this.studentsMap.values()).find(
      student => student.rollNo === rollNo
    );
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const id = this.currentStudentID++;
    const newStudent: Student = { 
      ...student, 
      id,
      createdAt: new Date()
    };
    this.studentsMap.set(id, newStudent);
    return newStudent;
  }

  // Attendance methods implementation
  async getAttendanceByDate(classId: number, date: string): Promise<StudentWithAttendance[]> {
    const students = await this.getStudentsByClass(classId);
    
    const attendanceRecords = Array.from(this.attendanceMap.values()).filter(
      record => record.classId === classId && record.date === date
    );
    
    return students.map(student => {
      const record = attendanceRecords.find(record => record.studentId === student.id);
      return {
        ...student,
        isPresent: record ? record.isPresent : undefined
      };
    });
  }

  async saveAttendance(attendanceRecords: InsertAttendance[]): Promise<void> {
    for (const record of attendanceRecords) {
      const id = this.currentAttendanceID++;
      const newAttendance: Attendance = { 
        ...record, 
        id,
        createdAt: new Date()
      };
      this.attendanceMap.set(id, newAttendance);
    }
  }

  async getAttendanceReport(classId: number, startDate?: string, endDate?: string): Promise<Attendance[]> {
    let records = Array.from(this.attendanceMap.values()).filter(
      record => record.classId === classId
    );
    
    if (startDate) {
      records = records.filter(record => record.date >= startDate);
    }
    
    if (endDate) {
      records = records.filter(record => record.date <= endDate);
    }
    
    return records;
  }

  async getAttendanceSummary(classId: number, date: string): Promise<AttendanceSummary> {
    const records = Array.from(this.attendanceMap.values()).filter(
      record => record.classId === classId && record.date === date
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
    const totalClasses = this.classesMap.size;
    const totalStudents = this.studentsMap.size;
    
    // Calculate today's attendance percentage
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = Array.from(this.attendanceMap.values()).filter(
      record => record.date === today
    );
    
    const presentToday = todayRecords.filter(record => record.isPresent).length;
    const todayAttendance = todayRecords.length > 0 
      ? Math.round((presentToday / todayRecords.length) * 100) 
      : 0;
    
    // Count reports as the number of unique dates for which attendance was taken
    const uniqueDates = new Set(Array.from(this.attendanceMap.values()).map(record => record.date));
    const reportsGenerated = uniqueDates.size;
    
    return {
      totalClasses,
      totalStudents,
      todayAttendance,
      reportsGenerated
    };
  }
}

export const storage = new MemStorage();
