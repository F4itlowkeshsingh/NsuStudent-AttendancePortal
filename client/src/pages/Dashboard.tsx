import { Search, Plus, Calendar, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatsOverview from '@/components/dashboard/StatsOverview';
import ClassList from '@/components/dashboard/ClassList';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import QuickActions from '@/components/dashboard/QuickActions';
import AddClassModal from '@/components/modals/AddClassModal';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { ClassWithStudentCount } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const currentDate = format(new Date(), 'MMMM d, yyyy');
  
  // Fetch classes for dropdown
  const { data: classes, isLoading: isLoadingClasses } = useQuery<ClassWithStudentCount[]>({
    queryKey: ['/api/classes'],
  });
  
  // Auto-select first class when data is loaded
  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);
  
  // Get the currently selected class name
  const selectedClassName = classes?.find(c => c.id === selectedClassId)?.name || 'Select Class';
  
  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search..."
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
      
      {/* Stats Overview */}
      <StatsOverview />
      
      {/* Class List */}
      <ClassList />
      
      {/* Attendance Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              Today's Attendance Overview
            </CardTitle>
            <div className="text-sm text-neutral-500">{currentDate}</div>
          </CardHeader>
          
          <CardContent>
            {isLoadingClasses ? (
              <div className="flex flex-col space-y-4 items-center justify-center pt-4">
                <Skeleton className="h-48 w-48 rounded-full" />
                <div className="grid grid-cols-3 gap-4 w-full">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : classes && classes.length > 0 ? (
              <div>
                <div className="mb-4">
                  <Select value={selectedClassId?.toString()} onValueChange={(value) => setSelectedClassId(Number(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <AttendanceChart classId={selectedClassId || undefined} />
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-neutral-500 mb-4">No classes available for attendance tracking</p>
                <Button variant="outline" onClick={() => setIsAddClassModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Class
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center">
              <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </div>
      
      {/* Modals */}
      <AddClassModal 
        isOpen={isAddClassModalOpen} 
        onClose={() => setIsAddClassModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
