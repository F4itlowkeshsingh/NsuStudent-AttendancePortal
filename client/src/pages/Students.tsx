import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Student, Class } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddStudentModal from '@/components/modals/AddStudentModal';
import { EditStudentModal } from '@/components/modals/EditStudentModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const Students = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { data: classes, isLoading: loadingClasses } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
  });

  const { data: students, isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ['/api/students', selectedClassId],
    queryFn: () => {
      // If selectedClassId is NaN or undefined, fetch all students
      if (isNaN(Number(selectedClassId)) || selectedClassId === undefined) {
        return fetch('/api/students').then(r => r.json());
      } else {
        return fetch(`/api/students?classId=${selectedClassId}`).then(r => r.json());
      }
    },
  });

  const filteredStudents = students?.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.registrationNo && student.registrationNo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Students</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search students..."
              className="px-4 py-2 pr-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-neutral-500" />
          </div>
          <Button onClick={() => setIsAddStudentModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1" /> Add Student
          </Button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-64">
            <Select 
              onValueChange={(value) => setSelectedClassId(value ? parseInt(value) : undefined)}
              defaultValue={selectedClassId?.toString() || "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {!loadingClasses && classes?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStudents ? (
            <div className="text-center py-6 text-neutral-500">Loading students...</div>
          ) : filteredStudents && filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Registration No</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Class</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const studentClass = classes?.find(cls => cls.id === student.classId);
                  
                  return (
                    <TableRow key={student.id} className="hover:bg-neutral-50">
                      <TableCell className="font-medium">{student.rollNo}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.registrationNo || '-'}</TableCell>
                      <TableCell>{student.email || '-'}</TableCell>
                      <TableCell>{student.mobile || '-'}</TableCell>
                      <TableCell>{studentClass?.name || '-'}</TableCell>
                      <TableCell className="text-right w-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStudent(student);
                                setIsEditStudentModalOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${student.name}?`)) {
                                  fetch(`/api/students/${student.id}`, { method: 'DELETE' })
                                    .then(response => {
                                      if (response.ok) {
                                        // Refresh student list
                                        window.location.reload();
                                      } else {
                                        alert('Cannot delete student with attendance records');
                                      }
                                    })
                                    .catch(error => {
                                      console.error('Error deleting student:', error);
                                      alert('Failed to delete student');
                                    });
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-neutral-500">
              No students found. Add students to get started.
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modals */}
      <AddStudentModal 
        isOpen={isAddStudentModalOpen} 
        onClose={() => setIsAddStudentModalOpen(false)} 
      />
      
      {/* Edit Modal */}
      {selectedStudent && classes && (
        <EditStudentModal
          isOpen={isEditStudentModalOpen}
          onClose={() => {
            setIsEditStudentModalOpen(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          classOptions={classes}
        />
      )}
    </div>
  );
};

export default Students;
