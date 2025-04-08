import { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ClassWithStudentCount } from '@shared/schema';
import { Button } from '@/components/ui/button';
import TakeAttendanceModal from '@/components/modals/TakeAttendanceModal';
import { useToast } from '@/hooks/use-toast';

const ManualAttendanceButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: classes, isLoading } = useQuery<ClassWithStudentCount[]>({
    queryKey: ['/api/classes'],
  });

  const handleClick = () => {
    if (!classes || classes.length === 0) {
      toast({
        title: "No classes available",
        description: "Please create a class first to take attendance",
        variant: "destructive"
      });
      return;
    }
    
    setIsModalOpen(true);
  };
  
  return (
    <>
      <Button 
        variant="secondary" 
        onClick={handleClick}
        className="flex items-center gap-2"
      >
        <CalendarCheck className="h-4 w-4" />
        <span>Manual Attendance</span>
      </Button>
      
      {classes && classes.length > 0 && (
        <TakeAttendanceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          classData={classes[0]}
        />
      )}
    </>
  );
};

export default ManualAttendanceButton;