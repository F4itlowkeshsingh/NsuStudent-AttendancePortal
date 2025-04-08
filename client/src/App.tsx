import { Switch, Route } from "wouter";
import Dashboard from "@/pages/Dashboard";
import Classes from "@/pages/Classes";
import Students from "@/pages/Students";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NavigationTabs from "@/components/layout/NavigationTabs";
import { useState } from "react";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-800">
      <Header />
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
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

export default App;
