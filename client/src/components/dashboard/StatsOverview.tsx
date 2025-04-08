import { Users, User, CalendarCheck, FileBarChart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DashboardStats } from '@shared/schema';

const StatsOverview = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });
  
  const statsCards = [
    {
      title: "Total Classes",
      value: stats?.totalClasses || 0,
      icon: <Users className="text-xl" />,
      color: "bg-blue-100 text-primary"
    },
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: <User className="text-xl" />,
      color: "bg-green-100 text-success"
    },
    {
      title: "Today's Attendance",
      value: `${stats?.todayAttendance || 0}%`,
      icon: <CalendarCheck className="text-xl" />,
      color: "bg-amber-100 text-warning"
    },
    {
      title: "Reports Generated",
      value: stats?.reportsGenerated || 0,
      icon: <FileBarChart className="text-xl" />,
      color: "bg-red-100 text-danger"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {statsCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">{card.title}</p>
              <p className="text-2xl font-semibold">
                {isLoading ? "-" : card.value}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full ${card.color} flex items-center justify-center`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
