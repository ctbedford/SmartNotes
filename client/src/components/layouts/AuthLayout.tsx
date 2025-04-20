import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/lib/stores";
import { supabase } from "@/lib/supabase";
import MainLayout from "./MainLayout";
import { Spinner } from "@/components/ui/spinner";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          setUser(data.session.user);
        } else {
          setLocation("/login");
        }
      } catch (error) {
        console.error("Auth error:", error);
        setLocation("/login");
      } finally {
        setLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setLocation("/login");
        }
      }
    );

    checkAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser, setLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login in useEffect
  }

  return <MainLayout>{children}</MainLayout>;
}
