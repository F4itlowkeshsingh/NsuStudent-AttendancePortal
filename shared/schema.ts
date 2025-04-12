import mongoose from 'mongoose';
import { z } from 'zod';

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

export const User = mongoose.model('User', userSchema);

// Class Schema
const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  subject: String,
  createdAt: { type: Date, default: Date.now }
});

export const Class = mongoose.model('Class', classSchema);

// Student Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  registrationNo: String,
  email: String,
  mobile: String,
  createdAt: { type: Date, default: Date.now }
});

export const Student = mongoose.model('Student', studentSchema);

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, required: true },
  isPresent: { type: Boolean, required: true },
  subject: String,
  timeSlot: String,
  createdAt: { type: Date, default: Date.now }
});

export const Attendance = mongoose.model('Attendance', attendanceSchema);

// Zod Schemas for validation
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string()
});

export const insertClassSchema = z.object({
  name: z.string(),
  department: z.string(),
  semester: z.number(),
  subject: z.string().optional()
});

export const insertStudentSchema = z.object({
  name: z.string(),
  rollNo: z.string(),
  classId: z.string(),
  registrationNo: z.string().optional(),
  email: z.string().optional(),
  mobile: z.string().optional()
});

export const insertAttendanceSchema = z.object({
  studentId: z.string(),
  classId: z.string(),
  date: z.date(),
  isPresent: z.boolean(),
  subject: z.string().optional(),
  timeSlot: z.string().optional()
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

// Extended types
export type StudentWithAttendance = {
  _id: string;
  name: string;
  rollNo: string;
  classId: string;
  registrationNo?: string;
  email?: string;
  mobile?: string;
  isPresent?: boolean;
};

export type ClassWithStudentCount = {
  _id: string;
  name: string;
  department: string;
  semester: number;
  subject?: string;
  studentCount: number;
  lastUpdated?: string;
};

export type AttendanceSummary = {
  date: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
};

export type DashboardStats = {
  totalClasses: number;
  totalStudents: number;
  todayAttendance: number;
  reportsGenerated: number;
};