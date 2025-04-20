import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useAuthStore } from "@/lib/stores";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    try {
      // For demo purposes, we'll simulate a successful login
      // In a production app, we would use the real Supabase auth
      // const { error } = await supabase.auth.signInWithOtp({
      //   email,
      //   options: {
      //     emailRedirectTo: window.location.origin + "/auth/callback",
      //   },
      // });
      
      // if (error) throw error;

      // Demo mode: Set a mock user in the auth store
      setTimeout(() => {
        const mockUser = {
          id: "demo-user-id",
          email: email,
          user_metadata: {
            name: email.split('@')[0],
          }
        };
        
        // This would normally be set by the auth callback
        useAuthStore.getState().setUser(mockUser);
        
        // Redirect to dashboard
        setLocation("/");
      }, 1500);
      
      setIsSent(true);
      toast({
        title: "Demo mode activated!",
        description: "You'll be redirected to the dashboard shortly",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send magic link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Aether Lite</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2 text-primary tracking-wide">AETHER LITE</CardTitle>
            <CardDescription>
              {isSent 
                ? "Demo mode activated"
                : "Enter any email to try the demo"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent>
              {!isSent ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-md text-center">
                  <p className="text-sm text-slate-700">
                    Demo mode activated for <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    You'll be automatically redirected to the dashboard (no email required)
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {!isSent ? (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email}
                >
                  {isLoading ? "Logging in..." : "Demo Login"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSent(false)}
                >
                  Use a different email
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
