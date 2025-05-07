import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { LockKeyhole, ShieldAlert, User, Save } from "lucide-react";

// Admin credentials - in a real app, this would be handled securely on the backend
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const navigate = useNavigate();

  // Check if there's stored authentication
  useEffect(() => {
    // Check for trusted device authentication
    const trustedAuth = localStorage.getItem("adminTrustedAuth");
    if (trustedAuth === "true") {
      const storedUsername = localStorage.getItem("adminUsername");
      if (storedUsername) {
        // Auto-login for trusted devices
        localStorage.setItem("isAdminAuthenticated", "true");
        localStorage.setItem("adminLoginTime", new Date().toISOString());
        navigate("/admin");
      }
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Simulate API delay
    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Set authentication state - in a real app, this would use proper JWT tokens
        localStorage.setItem("isAdminAuthenticated", "true");
        localStorage.setItem("adminUsername", username);
        localStorage.setItem("adminLoginTime", new Date().toISOString());
        
        // Set trusted device flag if checkbox is checked
        if (trustDevice) {
          localStorage.setItem("adminTrustedAuth", "true");
        }
        
        // Redirect to admin portal
        navigate("/admin");
      } else {
        setError("Invalid username or password. Please try again.");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)] px-4"
    >
      <Card className="w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Admin Access</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <LockKeyhole className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="trustDevice" 
                  checked={trustDevice}
                  onCheckedChange={(checked) => setTrustDevice(!!checked)} 
                />
                <Label 
                  htmlFor="trustDevice" 
                  className="text-sm cursor-pointer flex items-center"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  Trust this device (auto-login next time)
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Authenticating..." : "Login to Admin Portal"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Authorized Personnel Only
          </div>
          <div className="text-xs text-muted-foreground">
            Pune Municipal Corporation © {new Date().getFullYear()}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AdminLogin; 