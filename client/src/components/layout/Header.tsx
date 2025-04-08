import { User, Bell, LogOut } from 'lucide-react';
import nsuLogo from '@/assets/nsu-logo.png';
import ManualAttendanceButton from '@/components/attendance/ManualAttendanceButton';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  onLogout?: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={nsuLogo} 
            alt="Netaji Subhash University Logo" 
            className="h-14 w-auto"
          />
          <div>
            <h1 className="text-xl font-semibold">Netaji Subhash University</h1>
            <p className="text-sm opacity-90">Attendance Management System</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="hidden md:block">
            <ManualAttendanceButton />
          </div>
          
          <Separator orientation="vertical" className="h-8 bg-blue-700/30 hidden md:block" />
          
          <div className="flex items-center space-x-1 bg-blue-700 px-3 py-1.5 rounded-full">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Admin User</span>
          </div>
          
          <button 
            className="p-2 rounded-full hover:bg-blue-700 transition-all"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          
          <button 
            className="p-2 rounded-full hover:bg-blue-700 transition-all"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Mobile attendance button */}
      <div className="md:hidden border-t border-blue-700/30 px-4 py-2">
        <ManualAttendanceButton />
      </div>
    </header>
  );
};

export default Header;
