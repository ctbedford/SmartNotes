import { useAuthStore } from "@/lib/stores";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { calculatelevel, calculateXpProgress } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export default function XpProgress() {
  const { user } = useAuthStore();

  const { data: totalXp, isLoading } = useQuery({
    queryKey: ['xpTotal'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xp_ledger')
        .select('delta')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      return data.reduce((sum, item) => sum + item.delta, 0);
    },
    enabled: !!user?.id,
  });

  // Set up real-time subscription for XP updates
  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase
      .channel('xp-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'xp_ledger',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        // Invalidate the query to refetch data
        supabase.getQueryData(['xpTotal']);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const level = totalXp !== undefined ? Math.floor(totalXp / 100) + 1 : 1;
  const progress = totalXp !== undefined ? (totalXp % 100) / 100 : 0;
  const currentLevelXp = totalXp !== undefined ? totalXp % 100 : 0;

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm rounded-lg px-4 py-2 flex items-center space-x-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-1" />
        <Skeleton className="h-5 w-16" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow-sm rounded-lg px-4 py-2 flex items-center space-x-2">
        <span className="material-icons text-primary">stars</span>
        <span className="font-bold text-lg">{totalXp || 0} XP</span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-700 font-semibold">Level {level}</span>
      </div>

      <div className="mt-2">
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs text-slate-500">Level progress</div>
          <div className="text-xs font-medium">{currentLevelXp}/100 XP</div>
        </div>
        <Progress value={progress * 100} className="h-1.5" />
      </div>
    </div>
  );
}
