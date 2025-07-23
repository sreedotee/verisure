import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { signIn, signUp } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { user, error } = await signIn(loginData.email, loginData.password);
    
    if (user) {
      setUser(user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.role}`,
      });
      
      // Redirect based on role
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'manufacturer') navigate('/manufacturer');
      else navigate('/customer');
    } else {
      toast({
        title: "Login failed",
        description: error?.message || "Invalid credentials",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.email || !signupData.password || !signupData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { user, error } = await signUp(signupData.email, signupData.password);
    
    if (user) {
      setUser(user);
      toast({
        title: "Account created!",
        description: `Welcome to VeriSure as ${user.role}`,
      });
      
      // Redirect based on role
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'manufacturer') navigate('/manufacturer');
      else navigate('/customer');
    } else {
      toast({
        title: "Signup failed",
        description: error?.message || "Could not create account",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <ShieldCheck className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">VeriSure</h1>
          <p className="text-muted-foreground">Secure product authentication</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Access Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    <LogIn className="h-4 w-4 mr-2" />
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use 'admin@', 'manufacturer@', or any other email for different roles
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">Use demo credentials to login.</h3>
          <div className="text-sm space-y-1">
            <p><strong>Admin:</strong> admin@verisure.com / password123</p>
            <p><strong>Manufacturer:</strong> manufacturer@verisure.com / password123</p>
            <p><strong>Customer:</strong> customer@verisure.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;