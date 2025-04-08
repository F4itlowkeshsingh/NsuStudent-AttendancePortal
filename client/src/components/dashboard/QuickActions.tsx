import { UserPlus, UsersRound, CalendarCheck, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import AddStudentModal from '@/components/modals/AddStudentModal';
import AddClassModal from '@/components/modals/AddClassModal';
import TakeAttendanceModal from '@/components/modals/TakeAttendanceModal';
import { useQuery } from '@tanstack/react-query';
import { ClassWithStudentCount } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

const QuickActions = () => {
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isTakeAttendanceOpen, setIsTakeAttendanceOpen] = useState(false);
  
  const { data: classes } = useQuery<ClassWithStudentCount[]>({
    queryKey: ['/api/classes'],
  });
  
  const { toast } = useToast();
  
  const handleExportReport = () => {
    if (!classes || classes.length === 0) {
      toast({
        title: "No classes available",
        description: "Please create a class first to export reports",
        variant: "destructive"
      });
      return;
    }
    
    // Get the first class to export
    const firstClass = classes[0];
    
    // Export data as Excel
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Format dates as YYYY-MM-DD
    const endDate = today.toISOString().split('T')[0];
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Generate export URL
    const exportUrl = `/api/export/attendance?classId=${firstClass.id}&startDate=${startDate}&endDate=${endDate}`;
    
    // Download the file
    window.open(exportUrl, '_blank');
    
    toast({
      title: "Export started",
      description: `Exporting attendance data for ${firstClass.name}`,
    });
  };
  
  const actions = [
    {
      icon: <UserPlus className="text-xl" />,
      label: "Add Student",
      onClick: () => setIsAddStudentOpen(true)
    },
    {
      icon: <UsersRound className="text-xl" />,
      label: "Create Class",
      onClick: () => setIsAddClassOpen(true)
    },
    {
      icon: <CalendarCheck className="text-xl" />,
      label: "Take Attendance",
      onClick: () => setIsTakeAttendanceOpen(true)
    },
    {
      icon: <FileSpreadsheet className="text-xl" />,
      label: "Export Report",
      onClick: handleExportReport
    }
  ];
  
  return (
    <>
      <div className="p-6 grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button 
            key={index}
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-neutral-200 hover:border-primary hover:bg-blue-50 transition-all"
            onClick={action.onClick}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              {action.icon}
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
      
      <AddStudentModal 
        isOpen={isAddStudentOpen} 
        onClose={() => setIsAddStudentOpen(false)} 
      />
      
      <AddClassModal 
        isOpen={isAddClassOpen} 
        onClose={() => setIsAddClassOpen(false)} 
      />
      
      {classes && classes.length > 0 && (
        <TakeAttendanceModal 
          isOpen={isTakeAttendanceOpen} 
          onClose={() => setIsTakeAttendanceOpen(false)}
          classData={classes[0]}
        />
      )}
    </>
  );
};

export default QuickActions;
