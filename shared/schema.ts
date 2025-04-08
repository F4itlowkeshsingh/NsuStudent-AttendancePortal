import { pgTable, text, serial, integer, boolean, date, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table (keeping the existing one)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Classes table for different courses/batches
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  semester: integer("semester").notNull(),
  subject: text("subject"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClassSchema = createInsertSchema(classes).pick({
  name: true,
  department: true,
  semester: true,
  subject: true,
});

export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rollNo: text("roll_no").notNull().unique(),
  classId: integer("class_id").notNull(),
  registrationNo: text("registration_no"),
  email: text("email"),
  mobile: text("mobile"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  rollNo: true,
  classId: true,
  registrationNo: true,
  email: true,
  mobile: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Attendance records
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  date: date("date").notNull(),
  isPresent: boolean("is_present").notNull(),
  subject: text("subject"),
  timeSlot: text("time_slot"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAttendanceSchema = createInsertSchema(attendance).pick({
  studentId: true,
  classId: true,
  date: true,
  isPresent: true,
  subject: true,
  timeSlot: true,
});

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

// Define some extended types for combined data
export type StudentWithAttendance = Student & {
  isPresent?: boolean;
};

export type ClassWithStudentCount = Class & {
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

// Define relations between tables
export const classesRelations = relations(classes, ({ many }) => ({
  students: many(students),
  attendances: many(attendance)
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id]
  }),
  attendances: many(attendance)
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id]
  }),
  class: one(classes, {
    fields: [attendance.classId],
    references: [classes.id]
  })
}));
