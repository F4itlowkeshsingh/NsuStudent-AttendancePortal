import { Switch, Route, Redirect } from "wouter";
import Dashboard from "@/pages/Dashboard";
import Classes from "@/pages/Classes";
import Students from "@/pages/Students";
import Reports from "@/pages/Reports";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NavigationTabs from "@/components/layout/NavigationTabs";
import { useState } from "react";
import { useAuth, AuthProvider } from "@/lib/auth-context";

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { isAuthenticated, logout } = useAuth();
  
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
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-800">
      <Header onLogout={logout} />
      <main className="flex-1 container mx-auto px-4 py-6">
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <Switch>
          <Route path="/" component={() => {
            setActiveTab("dashboard");
            return <Dashboard />;
          }} />
          <Route path="/classes" component={() => {
            setActiveTab("classes");
            return <Classes />;
          }} />
          <Route path="/students" component={() => {
            setActiveTab("students");
            return <Students />;
          }} />
          <Route path="/reports" component={() => {
            setActiveTab("reports");
            return <Reports />;
          }} />
          <Route path="/login" component={Login} />
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
