
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginProps {
  onLogin: (user: { email: string; name: string }) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && !name) {
      toast({
        title: "Missing Information",
        description: "Please enter your name to sign up.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isLogin) {
        // Login logic - check against localStorage
        const savedUsers = JSON.parse(localStorage.getItem("cyclesense-users") || "[]");
        const user = savedUsers.find((u: any) => u.email === email && u.password === password);
        
        if (user) {
          localStorage.setItem("cyclesense-current-user", JSON.stringify({
            email: user.email,
            name: user.name
          }));
          onLogin({ email: user.email, name: user.name });
          toast({
            title: "Welcome back!",
            description: `Logged in successfully as ${user.name}`,
          });
        } else {
          throw new Error("Invalid email or password");
        }
      } else {
        // Sign up logic - save to localStorage
        const savedUsers = JSON.parse(localStorage.getItem("cyclesense-users") || "[]");
        
        // Check if user already exists
        if (savedUsers.some((u: any) => u.email === email)) {
          throw new Error("An account with this email already exists");
        }

        const newUser = { email, password, name };
        savedUsers.push(newUser);
        localStorage.setItem("cyclesense-users", JSON.stringify(savedUsers));
        localStorage.setItem("cyclesense-current-user", JSON.stringify({
          email,
          name
        }));
        
        onLogin({ email, name });
        toast({
          title: "Account created!",
          description: `Welcome to CycleSense, ${name}!`,
        });
      }
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-rose-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {isLogin ? "Sign in to access your cycle data" : "Join CycleSense to start tracking"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 transition-all duration-300 focus:scale-105"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 transition-all duration-300 focus:scale-105"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 transition-all duration-300 focus:scale-105"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                  ) : (
                    <Eye className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              {isLoading ? (
                "Processing..."
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-purple-600 hover:text-purple-800 transition-colors duration-300 hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
