import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";

// Authentication Context Type
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

// Create Auth Context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [, navigate] = useLocation();

  // Check if user is authenticated on load
  useEffect(() => {
    const checkAuth = () => {
      // In a real app, we would check session/token validity
      const authenticated = localStorage.getItem("isAuthenticated") === "true";
      setIsAuthenticated(authenticated);
      
      // Redirect to login if not authenticated, otherwise to dashboard
      if (!authenticated && window.location.pathname !== '/login') {
        navigate('/login');
      } else if (authenticated && window.location.pathname === '/login') {
        navigate('/');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const login = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component (for future use)
export const ProtectedRoute: React.FC<{ 
  component: React.ComponentType; 
  path?: string 
}> = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <></>;  // Will be handled by App.tsx's routing
  }
  
  return <Component />;
};