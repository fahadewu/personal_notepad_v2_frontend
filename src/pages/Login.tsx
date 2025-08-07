import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { KeyRound } from "lucide-react";
import dojoLomLogo from "@/assets/dojo-lom-complete-logo.png";
import axios from "axios";


const Login = () => {
  const [passkey, setPasskey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  // Dummy passkey for demonstration
  const DUMMY_PASSKEY = "dojo123";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    await axios.post("http://localhost:3000/api/notepad/auth", { token: passkey }).then((response) => {
          if (response.status === 200) {
      login(); 
      toast({
        title: "Login Successful",
        description: "Welcome to Dojo LoM!",
      });
      navigate("/");
    } else {
      toast({
        title: "Invalid Passkey",
        description: "Please enter the correct master key.",
        variant: "destructive",
      });
    }
    }
    ).catch((error) => {
      console.error("Error validating passkey:", error);
      toast({
        title: "Authentication Failed",
        description: "Unable to validate passkey. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    });


    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={dojoLomLogo} 
              alt="Dojo LoM" 
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Secure Access</CardTitle>
          <CardDescription>
            Enter your master key to access Dojo LoM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passkey">Master Key</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passkey"
                  type="password"
                  placeholder="Enter your passkey"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !passkey}
            >
              {isLoading ? "Authenticating..." : "Access Dojo"}
            </Button>
          </form>
          <div className="mt-4 text-xs text-center text-muted-foreground">
            Demo passkey: <code className="bg-muted px-1 rounded">dojo123</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;