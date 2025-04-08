import { MailService } from '@sendgrid/mail';
import { Student } from '@shared/schema';

// Initialize SendGrid client
const mailService = new MailService();

// Set API key if it exists in environment
if (!process.env.SENDGRID_API_KEY) {
  console.warn("SendGrid API key not found in environment variables. Email notifications will not work.");
} else {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = 'attendance@netajisubhashuniversity.edu.in'; // Change to your verified sender

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    return false;
  }
  
  try {
    await mailService.send({
      to: options.to,
      from: FROM_EMAIL,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send attendance notification to student
 */
export async function sendAttendanceNotification(
  student: Student,
  className: string,
  date: string,
  isPresent: boolean
): Promise<boolean> {
  if (!student.email) {
    return false;
  }

  const subject = `Attendance Update - ${className}`;
  const status = isPresent ? 'Present' : 'Absent';
  const statusColor = isPresent ? '#4CAF50' : '#F44336';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #b71c1c; margin: 0;">Netaji Subhash University</h2>
        <p style="color: #666; font-size: 14px; margin: 5px 0;">Attendance Management System</p>
      </div>
      
      <p>Dear <strong>${student.name}</strong>,</p>
      
      <p>This is to inform you that your attendance has been marked for the following class:</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <p><strong>Class:</strong> ${className}</p>
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></p>
      </div>
      
      <p>If you believe this information is incorrect, please contact your faculty or department immediately.</p>
      
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
        <p>This is an automated message from the Attendance Management System. Please do not reply to this email.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: student.email,
    subject,
    html,
  });
}

/**
 * Send attendance summary to faculty
 */
export async function sendAttendanceSummary(
  facultyEmail: string,
  className: string,
  date: string,
  presentCount: number,
  totalCount: number
): Promise<boolean> {
  const subject = `Attendance Summary - ${className}`;
  const percentage = Math.round((presentCount / totalCount) * 100);
  
  let statusColor = '#F44336'; // Red
  if (percentage >= 90) {
    statusColor = '#4CAF50'; // Green
  } else if (percentage >= 75) {
    statusColor = '#FF9800'; // Orange
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #b71c1c; margin: 0;">Netaji Subhash University</h2>
        <p style="color: #666; font-size: 14px; margin: 5px 0;">Attendance Management System</p>
      </div>
      
      <p>Dear Faculty,</p>
      
      <p>Here is the attendance summary for today's class:</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <p><strong>Class:</strong> ${className}</p>
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        <p><strong>Attendance:</strong> ${presentCount} present out of ${totalCount} students</p>
        <p><strong>Percentage:</strong> <span style="color: ${statusColor}; font-weight: bold;">${percentage}%</span></p>
      </div>
      
      <p>You can view detailed attendance information by logging into the Attendance Management System.</p>
      
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
        <p>This is an automated message from the Attendance Management System. Please do not reply to this email.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: facultyEmail,
    subject,
    html,
  });
}