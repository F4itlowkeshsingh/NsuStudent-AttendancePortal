import { UserPlus, UsersRound, CalendarCheck, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import AddStudentModal from '@/components/modals/AddStudentModal';
import AddClassModal from '@/components/modals/AddClassModal';
import TakeAttendanceModal from '@/components/modals/TakeAttendanceModal';
import { useQuery } from '@tanstack/react-query';
import { ClassWithStudentCount } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const QuickActions = () => {
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isTakeAttendanceOpen, setIsTakeAttendanceOpen] = useState(false);
  const [, navigate] = useLocation();
  
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
    
    // Navigate to reports page
    navigate("/reports");
    
    toast({
      title: "Reports Page",
      description: "You can now select a class and generate reports",
    });
  };
  
  const handleTakeAttendance = () => {
    if (!classes || classes.length === 0) {
      toast({
        title: "No classes available",
        description: "Please create a class first to take attendance",
        variant: "destructive"
      });
      return;
    }
    
    setIsTakeAttendanceOpen(true);
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
      onClick: handleTakeAttendance
    },
    {
      icon: <FileSpreadsheet className="text-xl" />,
      label: "Generate Report",
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
