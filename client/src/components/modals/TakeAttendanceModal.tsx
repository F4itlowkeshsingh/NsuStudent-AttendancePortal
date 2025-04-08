import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StudentWithAttendance, ClassWithStudentCount } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface TakeAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: ClassWithStudentCount;
}

const TakeAttendanceModal: React.FC<TakeAttendanceModalProps> = ({
  isOpen,
  onClose,
  classData,
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);
  const [timeSlot, setTimeSlot] = useState("Morning (9:00 AM - 12:00 PM)");
  const [subject, setSubject] = useState("Data Structures");
  
  const { data: studentsWithAttendance, isLoading } = useQuery<StudentWithAttendance[]>({
    queryKey: ['/api/attendance', classData.id, date],
    queryFn: () => fetch(`/api/attendance?classId=${classData.id}&date=${date}`).then(r => r.json()),
    enabled: isOpen,
  });
  
  // Local state to track attendance
  const [attendanceState, setAttendanceState] = useState<Record<number, boolean>>({});
  
  // Initialize attendance state when data is loaded
  useEffect(() => {
    if (studentsWithAttendance) {
      const initialState: Record<number, boolean> = {};
      studentsWithAttendance.forEach(student => {
        initialState[student.id] = student.isPresent ?? true; // Default to present
      });
      setAttendanceState(initialState);
    }
  }, [studentsWithAttendance]);
  
  // Calculate summary
  const presentCount = Object.values(attendanceState).filter(Boolean).length;
  const totalCount = Object.keys(attendanceState).length;
  const absentCount = totalCount - presentCount;
  
  // Save attendance mutation
  const saveAttendanceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/attendance', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save attendance: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  const handleSaveAttendance = () => {
    if (!studentsWithAttendance) return;
    
    const attendanceData = studentsWithAttendance.map(student => ({
      studentId: student.id,
      isPresent: attendanceState[student.id] ?? false
    }));
    
    saveAttendanceMutation.mutate({
      classId: classData.id,
      date,
      subject,
      timeSlot,
      attendanceData
    });
  };
  
  const toggleAttendance = (studentId: number) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Take Attendance: {classData.name}</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <Label>Date</Label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>
            <div className="flex-1">
              <Label>Time Slot</Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</SelectItem>
                  <SelectItem value="Afternoon (12:00 PM - 3:00 PM)">Afternoon (12:00 PM - 3:00 PM)</SelectItem>
                  <SelectItem value="Evening (3:00 PM - 6:00 PM)">Evening (3:00 PM - 6:00 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Data Structures">Data Structures</SelectItem>
                  <SelectItem value="Computer Networks">Computer Networks</SelectItem>
                  <SelectItem value="Operating Systems">Operating Systems</SelectItem>
                  <SelectItem value="Database Management">Database Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[50vh]">
          {isLoading ? (
            <div className="p-8 text-center text-neutral-500">Loading students...</div>
          ) : studentsWithAttendance && studentsWithAttendance.length > 0 ? (
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="bg-neutral-50 text-left">
                  <th className="px-6 py-3 text-sm font-medium text-neutral-500">Roll No.</th>
                  <th className="px-6 py-3 text-sm font-medium text-neutral-500">Student Name</th>
                  <th className="px-6 py-3 text-sm font-medium text-neutral-500 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {studentsWithAttendance.map((student) => (
                  <tr key={student.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                    <td className="px-6 py-3 text-sm">{student.rollNo}</td>
                    <td className="px-6 py-3">{student.name}</td>
                    <td className="px-6 py-3">
                      <div className="flex justify-center items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={attendanceState[student.id] || false}
                            onCheckedChange={() => toggleAttendance(student.id)}
                          />
                          <span 
                            className={`text-xs font-medium ${
                              attendanceState[student.id] ? 'text-green-600' : 'text-neutral-400'
                            }`}
                          >
                            {attendanceState[student.id] ? 'Present' : 'Absent'}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-neutral-500">
              No students found in this class. Add students first.
            </div>
          )}
        </div>
        
        <DialogFooter className="bg-neutral-50 px-4 py-3 border-t border-neutral-200">
          <div className="mr-auto text-sm text-neutral-500">
            <span className="font-medium">{totalCount}</span> students | <span className="font-medium text-success">{presentCount}</span> present | <span className="font-medium text-danger">{absentCount}</span> absent
          </div>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveAttendance} disabled={saveAttendanceMutation.isPending}>
            {saveAttendanceMutation.isPending ? "Saving..." : "Save Attendance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TakeAttendanceModal;
