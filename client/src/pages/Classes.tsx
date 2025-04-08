import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassWithStudentCount, Student } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, CalendarCheck, FileSpreadsheet, Pencil, Trash } from 'lucide-react';
import AddClassModal from '@/components/modals/AddClassModal';
import TakeAttendanceModal from '@/components/modals/TakeAttendanceModal';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Classes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassWithStudentCount | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: classes, isLoading: loadingClasses } = useQuery<ClassWithStudentCount[]>({
    queryKey: ['/api/classes'],
  });

  const { data: students, isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ['/api/students', selectedClass?.id],
    queryFn: () => fetch(`/api/students?classId=${selectedClass?.id}`).then(r => r.json()),
    enabled: !!selectedClass?.id,
  });

  const handleTakeAttendance = (cls: ClassWithStudentCount) => {
    setSelectedClass(cls);
    setIsAttendanceModalOpen(true);
  };

  const handleExportData = async (cls: ClassWithStudentCount) => {
    // Export data as Excel
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Format dates as YYYY-MM-DD
    const endDate = today.toISOString().split('T')[0];
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Generate export URL
    const exportUrl = `/api/export/attendance?classId=${cls.id}&startDate=${startDate}&endDate=${endDate}`;
    
    // Download the file
    window.open(exportUrl, '_blank');
    
    toast({
      title: "Export started",
      description: `Exporting attendance data for ${cls.name}`,
    });
  };

  const filteredClasses = classes?.filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Classes</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search classes..."
              className="px-4 py-2 pr-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-neutral-500" />
          </div>
          <Button onClick={() => setIsAddClassModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Class
          </Button>
        </div>
      </div>

      {/* Classes and Students View */}
      <Tabs defaultValue="classes">
        <TabsList className="mb-6">
          <TabsTrigger value="classes">All Classes</TabsTrigger>
          {selectedClass && (
            <TabsTrigger value="students">{selectedClass.name}</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Class List</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingClasses ? (
                <div className="text-center py-6 text-neutral-500">Loading classes...</div>
              ) : filteredClasses && filteredClasses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.map((cls) => (
                      <TableRow key={cls.id} className="hover:bg-neutral-50">
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>{cls.department}</TableCell>
                        <TableCell>{cls.semester}</TableCell>
                        <TableCell>{cls.studentCount} Students</TableCell>
                        <TableCell>{cls.lastUpdated || 'Not yet tracked'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-primary hover:bg-blue-50"
                              onClick={() => handleTakeAttendance(cls)}
                            >
                              <CalendarCheck className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-neutral-800 hover:bg-neutral-100"
                              onClick={() => setSelectedClass(cls)}
                            >
                              <Pencil className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-green-600 hover:bg-green-50"
                              onClick={() => handleExportData(cls)}
                            >
                              <FileSpreadsheet className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-neutral-500">
                  No classes found. Add a class to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="students">
          {selectedClass && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Students in {selectedClass.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleTakeAttendance(selectedClass)}
                    variant="outline"
                  >
                    <CalendarCheck className="h-4 w-4 mr-1" /> Take Attendance
                  </Button>
                  <Button
                    onClick={() => handleExportData(selectedClass)}
                    variant="outline"
                    className="text-green-600"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-1" /> Export Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingStudents ? (
                  <div className="text-center py-6 text-neutral-500">Loading students...</div>
                ) : students && students.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Registration No</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Mobile</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id} className="hover:bg-neutral-50">
                          <TableCell className="font-medium">{student.rollNo}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.registrationNo || '-'}</TableCell>
                          <TableCell>{student.email || '-'}</TableCell>
                          <TableCell>{student.mobile || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-neutral-500">
                    No students found in this class. Add students to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Modals */}
      <AddClassModal 
        isOpen={isAddClassModalOpen} 
        onClose={() => setIsAddClassModalOpen(false)} 
      />
      
      {selectedClass && (
        <TakeAttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          classData={selectedClass}
        />
      )}
    </div>
  );
};

export default Classes;
