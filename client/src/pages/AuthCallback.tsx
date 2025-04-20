import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Spinner } from "@/components/ui/spinner";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle auth callback (process the OTP)
        const { error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        // Redirect to the dashboard upon successful login
        setLocation("/");
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "Authentication failed");
        // Redirect to login after a delay if there's an error
        setTimeout(() => setLocation("/login"), 3000);
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      {error ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md max-w-md text-center">
          <h2 className="font-bold mb-2">Authentication Error</h2>
          <p>{error}</p>
          <p className="text-sm mt-2">Redirecting to login...</p>
        </div>
      ) : (
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <h2 className="text-xl font-medium mb-2">Authenticating...</h2>
          <p className="text-slate-500">You'll be redirected automatically.</p>
        </div>
      )}
    </div>
  );
}
