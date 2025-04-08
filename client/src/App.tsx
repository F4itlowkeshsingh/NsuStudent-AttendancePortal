import { Switch, Route, Redirect, useLocation } from "wouter";
import Dashboard from "@/pages/Dashboard";
import Classes from "@/pages/Classes";
import Students from "@/pages/Students";
import Reports from "@/pages/Reports";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NavigationTabs from "@/components/layout/NavigationTabs";
import { useState, useEffect } from "react";
import { useAuth, AuthProvider } from "@/lib/auth-context";

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { isAuthenticated, logout } = useAuth();
  const [location, navigate] = useLocation();
  
  // Update activeTab based on location
  useEffect(() => {
    if (location === "/") setActiveTab("dashboard");
    else if (location === "/classes") setActiveTab("classes");
    else if (location === "/students") setActiveTab("students");
    else if (location === "/reports") setActiveTab("reports");
  }, [location]);
  
  // For demonstration purposes, just render the main app or login screen
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }
  
  // Handle tab navigation - use proper routing instead of direct URL manipulation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    switch (tab) {
      case "dashboard":
        navigate("/");
        break;
      case "classes":
        navigate("/classes");
        break;
      case "students":
        navigate("/students");
        break;
      case "reports":
        navigate("/reports");
        break;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-800">
      <Header onLogout={logout} />
      <main className="flex-1 container mx-auto px-4 py-6">
        <NavigationTabs activeTab={activeTab} setActiveTab={handleTabChange} />
        
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/classes" component={Classes} />
          <Route path="/students" component={Students} />
          <Route path="/reports" component={Reports} />
          <Route path="/login">
            <Redirect to="/" />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

// App wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
