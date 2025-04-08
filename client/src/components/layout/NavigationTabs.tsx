import { Link, useLocation } from "wouter";

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, setActiveTab }) => {
  const [location, navigate] = useLocation();
  
  const tabs = [
    { id: "dashboard", label: "Dashboard", path: "/" },
    { id: "classes", label: "Classes", path: "/classes" },
    { id: "students", label: "Students", path: "/students" },
    { id: "reports", label: "Reports", path: "/reports" },
    { id: "settings", label: "Settings", path: "/settings" }
  ];
  
  const handleTabClick = (tabId: string, path: string) => {
    setActiveTab(tabId);
    navigate(path);
  };
  
  return (
    <div className="mb-6 border-b border-neutral-200">
      <nav className="flex overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium ${
              activeTab === tab.id 
                ? "text-primary border-b-2 border-primary" 
                : "text-neutral-800 hover:text-primary transition-all"
            } whitespace-nowrap`}
            onClick={() => handleTabClick(tab.id, tab.path)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default NavigationTabs;
