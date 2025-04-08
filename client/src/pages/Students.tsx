import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Student, Class } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, UserPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddStudentModal from '@/components/modals/AddStudentModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Students = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  const { data: classes, isLoading: loadingClasses } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
  });

  const { data: students, isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ['/api/students', selectedClassId],
    queryFn: () => {
      const url = selectedClassId 
        ? `/api/students?classId=${selectedClassId}`
        : '/api/students';
      return fetch(url).then(r => r.json());
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
              defaultValue={selectedClassId?.toString() || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
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
    </div>
  );
};

export default Students;
