import { useAuthStore } from "@/lib/stores";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { isDemoMode, getMockXpActivity } from "@/lib/demoData";

interface XpActivity {
  id: string;
  delta: number;
  source_description: string;
  created_at: string;
}

export default function RecentActivity() {
  const { user } = useAuthStore();
  const isDemo = isDemoMode();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['xpLedger'],
    queryFn: async () => {
      // For demo mode, return mock data
      if (isDemo) {
        return getMockXpActivity();
      }
      
      // Real Supabase data
      const { data, error } = await supabase
        .from('xp_ledger')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return data as XpActivity[];
    },
    enabled: !!user?.id,
  });

  // Set up real-time subscription for XP updates (not for demo mode)
  useEffect(() => {
    if (!user?.id || isDemo) return;
    
    const channel = supabase
      .channel('xp-activity-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'xp_ledger',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        // Invalidate the query to refetch data
        supabase.getQueryData(['xpLedger']);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isDemo]);

  const renderActivityIcon = (description: string) => {
    if (description.includes('Resonated')) {
      return <span className="material-icons text-secondary mr-2 text-sm">waves</span>;
    } else if (description.includes('Completed')) {
      return <span className="material-icons text-success mr-2 text-sm">task_alt</span>;
    }
    return <span className="material-icons text-primary mr-2 text-sm">stars</span>;
  };

  const renderSkeletonItem = () => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100">
      <div className="flex items-start">
        <Skeleton className="h-5 w-5 mr-2 rounded" />
        <div>
          <Skeleton className="h-4 w-48 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );

  return (
    <Card className="bg-white rounded-xl shadow-md border border-slate-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Recent XP Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <>
              {Array(5).fill(0).map((_, i) => (
                <div key={i}>{renderSkeletonItem()}</div>
              ))}
            </>
          ) : activities.length === 0 ? (
            <div className="py-6 text-center text-slate-500">
              No activity yet. Start resonating with values or completing tasks!
            </div>
          ) : (
            activities.map((activity, index) => (
              <div 
                key={activity.id} 
                className={`flex items-center justify-between py-2 ${
                  index < activities.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <div className="flex items-start">
                  {renderActivityIcon(activity.source_description)}
                  <div>
                    <div className="text-sm font-medium">{activity.source_description}</div>
                    <div className="text-xs text-slate-500">{formatDate(activity.created_at)}</div>
                  </div>
                </div>
                <div className="font-semibold text-sm text-primary">+{activity.delta} XP</div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
