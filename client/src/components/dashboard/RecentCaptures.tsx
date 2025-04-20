import { useAuthStore } from "@/lib/stores";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { isDemoMode, getMockCaptures } from "@/lib/demoData";

interface Capture {
  id: string;
  kind: 'THOUGHT' | 'EXTERNAL_LINK';
  body: string | null;
  url: string | null;
  created_at: string;
}

export default function RecentCaptures() {
  const { user } = useAuthStore();
  const isDemo = isDemoMode();

  const { data: captures = [], isLoading } = useQuery({
    queryKey: ['recentCaptures'],
    queryFn: async () => {
      // For demo mode, return mock data
      if (isDemo) {
        return getMockCaptures();
      }

      // Real Supabase data
      const { data, error } = await supabase
        .from('captures')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return data as Capture[];
    },
    enabled: !!user?.id,
  });

  // Set up real-time subscription for capture updates (not for demo mode)
  useEffect(() => {
    if (!user?.id || isDemo) return;
    
    const channel = supabase
      .channel('captures-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'captures',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        // Invalidate the query to refetch data
        supabase.getQueryData(['recentCaptures']);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isDemo]);

  const renderSkeletonItem = () => (
    <div className="flex items-start py-2 border-b border-slate-100">
      <Skeleton className="h-5 w-5 mr-2 rounded" />
      <div className="w-full">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );

  return (
    <Card className="bg-white rounded-xl shadow-md border border-slate-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Recent Captures</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <>
              {Array(5).fill(0).map((_, i) => (
                <div key={i}>{renderSkeletonItem()}</div>
              ))}
            </>
          ) : captures.length === 0 ? (
            <div className="py-6 text-center text-slate-500">
              No captures yet. Start by clicking the "Spark" button!
            </div>
          ) : (
            captures.map((capture, index) => (
              <div 
                key={capture.id} 
                className={`flex items-start py-2 ${
                  index < captures.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <span className="material-icons text-slate-400 mr-2 text-sm">
                  {capture.kind === 'THOUGHT' ? 'lightbulb' : 'link'}
                </span>
                <div>
                  {capture.kind === 'THOUGHT' ? (
                    <div className="text-sm">{capture.body}</div>
                  ) : (
                    <div className="text-sm">
                      <a href={capture.url || "#"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {capture.url}
                      </a>
                    </div>
                  )}
                  <div className="text-xs text-slate-500 mt-1">{formatDate(capture.created_at)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
