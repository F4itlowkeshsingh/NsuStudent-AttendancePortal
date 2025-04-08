import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import nsuLogo from '@/assets/nsu-logo.svg';
import { useAuth } from '@/lib/auth-context';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // For demonstration - simulate successful login
    setTimeout(() => {
      setIsLoading(false);
      
      // Here we would normally validate credentials with the server
      if (username === 'admin' && password === 'password') {
        toast({
          title: 'Login Successful',
          description: 'Welcome to the Attendance Management System',
        });
        
        // Use the login function from auth context
        login();
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid username or password',
          variant: 'destructive',
        });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={nsuLogo}
              alt="Netaji Subhash University Logo"
              className="h-24 w-24"
            />
          </div>
          <h1 className="text-2xl font-bold text-neutral-800">Netaji Subhash University</h1>
          <p className="text-neutral-500">Attendance Management System</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the attendance system
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center mt-8 text-sm text-neutral-500">
          <p>For demonstration, use: admin / password</p>
          <p className="mt-6">© 2024 Netaji Subhash University. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;