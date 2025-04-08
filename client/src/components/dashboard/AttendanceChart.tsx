import { useQuery } from '@tanstack/react-query';
import { AttendanceSummary } from '@shared/schema';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AttendanceChartProps {
  classId?: number;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ classId }) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  const { data: summary, isLoading, isError } = useQuery<AttendanceSummary>({
    queryKey: ['/api/attendance/summary', classId, today],
    queryFn: async () => {
      if (!classId) {
        throw new Error("Class ID is required");
      }
      return fetch(`/api/attendance/summary?classId=${classId}&date=${today}`).then(r => {
        if (!r.ok) throw new Error("Failed to fetch attendance data");
        return r.json();
      });
    },
    enabled: !!classId,
    retry: 1,
  });
  
  // Fallback data if no summary or loading
  const percentage = summary?.percentage || 0;
  const present = summary?.present || 0;
  const absent = summary?.absent || 0;
  const total = summary?.total || 0;
  
  // Animate the percentage for better visibility
  useEffect(() => {
    if (!isLoading && !isError && summary) {
      // Reset to 0 first for animation
      setAnimatedPercentage(0);
      
      // Then animate to the actual percentage
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          setAnimatedPercentage(prev => {
            if (prev >= percentage) {
              clearInterval(interval);
              return percentage;
            }
            return prev + 1;
          });
        }, 20);
        
        return () => clearInterval(interval);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [percentage, isLoading, isError, summary]);
  
  // Calculate the clip-path angle for the pie chart
  // For a percentage, we need to convert it to degrees out of 360
  const calculateClipPath = (percent: number) => {
    // For 0%, return empty
    if (percent === 0) return 'polygon(50% 50%, 50% 0, 50% 0)';
    
    // For 100%, return full circle
    if (percent === 100) return 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0)';
    
    // Convert percentage to degrees
    const degrees = (percent / 100) * 360;
    
    // Calculate the end point based on the angle
    const endX = 50 + 50 * Math.sin(degrees * (Math.PI / 180));
    const endY = 50 - 50 * Math.cos(degrees * (Math.PI / 180));
    
    // For angles less than 180 degrees
    if (degrees <= 180) {
      return `polygon(50% 50%, 50% 0, ${endX}% ${endY}%)`;
    }
    
    // For angles greater than 180 degrees
    return `polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 0, ${endX}% ${endY}%)`;
  };
  
  const clipPath = calculateClipPath(animatedPercentage);
  
  // Determine color based on percentage
  const getColor = (percent: number) => {
    if (percent < 50) return 'bg-red-500';
    if (percent < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const chartColor = getColor(percentage);
  
  // If no class ID is selected, show a message
  if (!classId) {
    return (
      <div className="flex items-center justify-center py-8">
        <Alert className="max-w-md bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700">No class selected</AlertTitle>
          <AlertDescription className="text-amber-600">
            Please select a class to view attendance data
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // If there's an error fetching the data
  if (isError) {
    return (
      <div className="flex items-center justify-center py-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading attendance data</AlertTitle>
          <AlertDescription>
            There was a problem loading the attendance data for this class.
            Try taking attendance first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-center mb-8">
        {/* Perfect circle container with fixed aspect ratio */}
        <div className="relative aspect-square w-56 flex items-center justify-center">
          {/* Outer border circle */}
          <div className="absolute inset-0 rounded-full border-8 border-neutral-100"></div>
          
          {/* Colored portion (pie chart) */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0" style={{ clipPath }}>
              <div className={`w-full h-full ${chartColor} transition-all duration-300`}></div>
            </div>
          </div>
          
          {/* Inner white circle for contrast */}
          <div className="absolute inset-[15%] bg-white rounded-full shadow-inner"></div>
          
          {/* Text in the center */}
          <div className="relative flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{isLoading ? "-" : `${animatedPercentage}%`}</span>
            <span className="text-sm text-neutral-500 mt-1">Present</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-neutral-50 rounded-md border border-neutral-100">
          <div className="text-lg font-semibold text-green-600">{isLoading ? "-" : present}</div>
          <div className="text-xs text-neutral-500">Present</div>
        </div>
        <div className="p-4 bg-neutral-50 rounded-md border border-neutral-100">
          <div className="text-lg font-semibold text-red-500">{isLoading ? "-" : absent}</div>
          <div className="text-xs text-neutral-500">Absent</div>
        </div>
        <div className="p-4 bg-neutral-50 rounded-md border border-neutral-100">
          <div className="text-lg font-semibold text-blue-500">{isLoading ? "-" : total}</div>
          <div className="text-xs text-neutral-500">Total</div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;
