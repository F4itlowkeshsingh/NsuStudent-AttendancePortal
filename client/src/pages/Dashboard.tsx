import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatsOverview from '@/components/dashboard/StatsOverview';
import ClassList from '@/components/dashboard/ClassList';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import QuickActions from '@/components/dashboard/QuickActions';
import AddClassModal from '@/components/modals/AddClassModal';
import { format } from 'date-fns';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const currentDate = format(new Date(), 'MMMM d, yyyy');
  
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
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="border-b border-neutral-200 px-6 py-4 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Today's Attendance Overview</h3>
            <div className="text-sm text-neutral-500">{currentDate}</div>
          </div>
          
          <AttendanceChart />
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h3 className="font-semibold text-lg">Quick Actions</h3>
          </div>
          
          <QuickActions />
        </div>
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
