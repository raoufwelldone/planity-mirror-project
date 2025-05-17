
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const { login, user, session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "partner">("client");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

  // Check if user is already logged in and redirect if necessary
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Check if we have a session before redirecting
      if (user && session) {
        console.log("User already logged in:", user.id, "role:", user.role);
        const redirectPath = user.role === "client" ? "/client" : "/partner";
        navigate(redirectPath, { replace: true });
      }
    };

    // Only check for authentication if not loading
    if (!authLoading) {
      checkAuthAndRedirect();
    }
  }, [user, session, navigate, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, role);
      // Don't navigate here, let the useEffect handle it
      toast({
        title: "Success",
        description: "Successfully logged in!",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsForgotPasswordLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setForgotPasswordOpen(false);
      toast({
        title: "Success",
        description: "Password reset email has been sent!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  // If we're still loading auth state, show a loading spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is already authenticated, don't show the login form
  if (user && session) {
    return null; // This will be replaced by the redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sign In to BeautyCraft</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="client" onValueChange={(value) => setRole(value as "client" | "partner")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="partner">Partner</TabsTrigger>
            </TabsList>
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {location.state?.message && (
              <Alert variant="default" className="mb-6 bg-green-50">
                <AlertDescription>{location.state.message}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-normal text-sm text-blue-600" 
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                >
                  Forgot password?
                </Button>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="forgotPasswordEmail">Email</Label>
                <Input
                  id="forgotPasswordEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setForgotPasswordOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isForgotPasswordLoading}>
                {isForgotPasswordLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
