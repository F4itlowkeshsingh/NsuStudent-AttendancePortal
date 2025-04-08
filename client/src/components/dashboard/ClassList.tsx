import { CalendarCheck, UsersRound, FileSpreadsheet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ClassWithStudentCount } from '@shared/schema';
import { useState } from 'react';
import TakeAttendanceModal from '@/components/modals/TakeAttendanceModal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ClassList = () => {
  const { data: classes, isLoading } = useQuery<ClassWithStudentCount[]>({
    queryKey: ['/api/classes'],
  });
  
  const [selectedClass, setSelectedClass] = useState<ClassWithStudentCount | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const { toast } = useToast();
  
  const handleTakeAttendance = (cls: ClassWithStudentCount) => {
    setSelectedClass(cls);
    setIsAttendanceModalOpen(true);
  };
  
  const handleViewStudents = (cls: ClassWithStudentCount) => {
    window.location.href = `/classes?id=${cls.id}`;
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
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
        <div className="border-b border-neutral-200 px-6 py-4 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Recent Classes</h3>
          <Button variant="link" className="text-primary" onClick={() => window.location.href = '/classes'}>
            View All
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 text-left">
                <th className="px-6 py-3 text-sm font-medium text-neutral-500">Class Name</th>
                <th className="px-6 py-3 text-sm font-medium text-neutral-500">Department</th>
                <th className="px-6 py-3 text-sm font-medium text-neutral-500">Students</th>
                <th className="px-6 py-3 text-sm font-medium text-neutral-500">Last Updated</th>
                <th className="px-6 py-3 text-sm font-medium text-neutral-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-neutral-500">
                    Loading class data...
                  </td>
                </tr>
              ) : (
                classes && classes.length > 0 ? (
                  classes.map((cls) => (
                    <tr key={cls.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{cls.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">{cls.department}</td>
                      <td className="px-6 py-4 text-sm">{cls.studentCount} Students</td>
                      <td className="px-6 py-4 text-sm">{cls.lastUpdated || 'Not yet tracked'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            className="p-1.5 text-primary hover:bg-blue-50 rounded"
                            onClick={() => handleTakeAttendance(cls)}
                          >
                            <CalendarCheck className="h-5 w-5" />
                          </button>
                          <button 
                            className="p-1.5 text-neutral-800 hover:bg-neutral-100 rounded"
                            onClick={() => handleViewStudents(cls)}
                          >
                            <UsersRound className="h-5 w-5" />
                          </button>
                          <button 
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            onClick={() => handleExportData(cls)}
                          >
                            <FileSpreadsheet className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-neutral-500">
                      No classes found. Add a class to get started.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedClass && (
        <TakeAttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          classData={selectedClass}
        />
      )}
    </>
  );
};

export default ClassList;
