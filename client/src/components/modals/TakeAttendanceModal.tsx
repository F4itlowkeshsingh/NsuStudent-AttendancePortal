import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
import { CheckCircle, CircleX, CalendarClock, Book, Clock3, Users, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { calculateAttendancePercentage } from "@/lib/utils";

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
  const [selectedClassId, setSelectedClassId] = useState<number>(classData.id);
  const [className, setClassName] = useState(classData.name);
  const [sendEmails, setSendEmails] = useState(true);
  
  // Fetch all classes for the dropdown
  const { data: allClasses } = useQuery<ClassWithStudentCount[]>({
    queryKey: ['/api/classes'],
    queryFn: () => fetch('/api/classes').then(r => r.json()),
    enabled: isOpen,
  });
  
  // Fetch students based on the selected class
  const { data: studentsWithAttendance, isLoading } = useQuery<StudentWithAttendance[]>({
    queryKey: ['/api/attendance', selectedClassId, date],
    queryFn: () => fetch(`/api/attendance?classId=${selectedClassId}&date=${date}`).then(r => r.json()),
    enabled: isOpen && !!selectedClassId,
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
    
    // Set the class name when the modal opens
    if (isOpen && classData) {
      setClassName(classData.name);
    }
  }, [studentsWithAttendance, isOpen, classData]);
  
  // Calculate summary
  const presentCount = Object.values(attendanceState).filter(Boolean).length;
  const totalCount = Object.keys(attendanceState).length;
  const absentCount = totalCount - presentCount;
  const attendancePercentage = calculateAttendancePercentage(presentCount, totalCount);
  
  // Mark all present/absent
  const markAllPresent = () => {
    if (!studentsWithAttendance) return;
    
    const newState: Record<number, boolean> = {};
    studentsWithAttendance.forEach(student => {
      newState[student.id] = true;
    });
    setAttendanceState(newState);
  };
  
  const markAllAbsent = () => {
    if (!studentsWithAttendance) return;
    
    const newState: Record<number, boolean> = {};
    studentsWithAttendance.forEach(student => {
      newState[student.id] = false;
    });
    setAttendanceState(newState);
  };
  
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
        title: "Attendance Saved",
        description: `Successfully recorded attendance for ${presentCount} students`,
        variant: "default"
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
      classId: selectedClassId,
      date,
      subject: className, // using className value but keeping API param as subject for compatibility
      timeSlot,
      attendanceData,
      sendEmails
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
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Take Attendance
          </DialogTitle>
          <DialogDescription>
            Record attendance for {className}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 border-b border-neutral-200 bg-gradient-to-b from-blue-50 to-white rounded-md mb-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="flex items-center mb-1.5 text-xs font-medium text-neutral-500">
                <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
                Date
              </Label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="focus-visible:ring-blue-500"
              />
            </div>
            <div>
              <Label className="flex items-center mb-1.5 text-xs font-medium text-neutral-500">
                <Clock3 className="h-3.5 w-3.5 mr-1.5" />
                Time Slot
              </Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger className="focus-visible:ring-blue-500">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</SelectItem>
                  <SelectItem value="Afternoon (12:00 PM - 3:00 PM)">Afternoon (12:00 PM - 3:00 PM)</SelectItem>
                  <SelectItem value="Evening (3:00 PM - 6:00 PM)">Evening (3:00 PM - 6:00 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center mb-1.5 text-xs font-medium text-neutral-500">
                <Book className="h-3.5 w-3.5 mr-1.5" />
                Class
              </Label>
              <Select 
                value={className} 
                onValueChange={(name) => {
                  setClassName(name);
                  // Find the class ID that corresponds to the selected class name
                  const selectedClass = allClasses?.find(cls => cls.name === name);
                  if (selectedClass) {
                    setSelectedClassId(selectedClass.id);
                  }
                }}
              >
                <SelectTrigger className="focus-visible:ring-blue-500">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {allClasses ? (
                    allClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>
                        {cls.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={classData.name}>{classData.name}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Card className="mb-2 border-dashed">
          <CardContent className="p-3 flex flex-wrap justify-between items-center">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2 bg-blue-50 border-blue-100 text-blue-700">
                {totalCount} Students
              </Badge>
              
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-green-50 border-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {presentCount} Present
                </Badge>
                <Badge variant="outline" className="bg-red-50 border-red-100 text-red-700">
                  <CircleX className="h-3 w-3 mr-1" />
                  {absentCount} Absent
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllPresent}
                className="h-8 text-xs border-green-200 bg-green-50 hover:bg-green-100 text-green-700"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Mark All Present
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAbsent}
                className="h-8 text-xs border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
              >
                <CircleX className="h-3 w-3 mr-1" />
                Mark All Absent
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="overflow-y-auto max-h-[50vh] border rounded-md">
          {isLoading ? (
            <div className="p-8 text-center text-neutral-500 flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
              <p>Loading students...</p>
            </div>
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
                  <tr 
                    key={student.id} 
                    className={`border-t border-neutral-200 hover:bg-neutral-50 ${
                      attendanceState[student.id] ? 'bg-green-50' : 'bg-red-50'
                    }`}
                    onClick={() => toggleAttendance(student.id)}
                  >
                    <td className="px-6 py-3 text-sm">{student.rollNo}</td>
                    <td className="px-6 py-3 font-medium">{student.name}</td>
                    <td className="px-6 py-3">
                      <div className="flex justify-center items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={attendanceState[student.id] || false}
                            onCheckedChange={() => toggleAttendance(student.id)}
                          />
                          <Badge 
                            variant="outline"
                            className={`text-xs font-medium ${
                              attendanceState[student.id] 
                              ? 'bg-green-50 border-green-200 text-green-700' 
                              : 'bg-red-50 border-red-200 text-red-700'
                            }`}
                          >
                            {attendanceState[student.id] ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Present</>
                            ) : (
                              <><CircleX className="h-3 w-3 mr-1" /> Absent</>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-neutral-500">
              <p className="mb-2 font-medium">No students found in this class</p>
              <p className="text-sm">Please add students to the class before taking attendance</p>
            </div>
          )}
        </div>
        
        <div className="border-t border-neutral-200 pt-3 px-4 flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={sendEmails} 
              onCheckedChange={setSendEmails}
              id="email-notification"
            />
            <Label htmlFor="email-notification" className="text-sm cursor-pointer flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Send email notifications to students
            </Label>
          </div>
        </div>

        <DialogFooter className="px-4 py-3 border-t border-neutral-200 gap-2">
          <div className="flex items-center mr-auto">
            <div className="text-sm text-neutral-500">
              Attendance Rate: 
              <span 
                className={`ml-2 font-bold ${
                  attendancePercentage > 75 
                  ? 'text-green-600' 
                  : attendancePercentage > 50 
                  ? 'text-amber-600' 
                  : 'text-red-600'
                }`}
              >
                {attendancePercentage}%
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={onClose} className="gap-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAttendance} 
            disabled={saveAttendanceMutation.isPending || totalCount === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
          >
            {saveAttendanceMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Save Attendance
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TakeAttendanceModal;
