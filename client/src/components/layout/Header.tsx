import { User, Bell, LogOut } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg 
            className="h-10 w-10 text-white" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
          </svg>
          <div>
            <h1 className="text-xl font-semibold">Netaji Subhash University</h1>
            <p className="text-sm opacity-90">Attendance Management System</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-1 bg-blue-700 px-3 py-1.5 rounded-full">
            <User className="h-4 w-4" />
            <span>Admin User</span>
          </div>
          <button className="p-2 rounded-full hover:bg-blue-700 transition-all">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-blue-700 transition-all">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
