import { useState } from 'react';
import { CalendarCheck, CheckCircle2, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ClassWithStudentCount } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import TakeAttendanceModal from '@/components/modals/TakeAttendanceModal';
import { useToast } from '@/hooks/use-toast';

interface ClassSelectProps {
  classes: ClassWithStudentCount[];
  onClassSelect: (cls: ClassWithStudentCount) => void;
}

const ClassSelect = ({ classes, onClassSelect }: ClassSelectProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-blue-100">
          Select class <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <DropdownMenuLabel>Available Classes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {classes.map((cls) => (
          <DropdownMenuItem 
            key={cls.id}
            onClick={() => onClassSelect(cls)}
            className="cursor-pointer"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            <span>{cls.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ManualAttendanceButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassWithStudentCount | null>(null);
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
    
    if (classes.length === 1) {
      setSelectedClass(classes[0]);
      setIsModalOpen(true);
    } else {
      // If multiple classes, let user pick from dropdown
      setSelectedClass(null);
    }
  };
  
  const handleClassSelect = (cls: ClassWithStudentCount) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };
  
  return (
    <>
      {classes && classes.length > 1 ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="secondary" 
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Take Attendance</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-3">
              <div className="text-sm font-medium mb-2">Select a class to take attendance</div>
              <div className="space-y-1">
                {classes.map((cls) => (
                  <Button 
                    key={cls.id}
                    variant="ghost" 
                    size="sm"
                    className="w-full justify-start text-left gap-2"
                    onClick={() => handleClassSelect(cls)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {cls.name}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Button 
          variant="secondary" 
          onClick={handleClick}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white"
          disabled={isLoading}
        >
          <CalendarCheck className="h-4 w-4" />
          <span>Take Attendance</span>
        </Button>
      )}
      
      {selectedClass && (
        <TakeAttendanceModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedClass(null);
          }}
          classData={selectedClass}
        />
      )}
    </>
  );
};

export default ManualAttendanceButton;