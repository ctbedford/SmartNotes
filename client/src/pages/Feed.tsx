import { useState } from "react";
import { Helmet } from "react-helmet";
import { useAuthStore } from "@/lib/stores";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import CaptureCard from "@/components/feed/CaptureCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, SortDesc } from "lucide-react";
import { useEffect } from "react";

interface Capture {
  id: string;
  kind: 'THOUGHT' | 'EXTERNAL_LINK';
  body: string | null;
  url: string | null;
  created_at: string;
}

export default function Feed() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'ALL' | 'THOUGHT' | 'EXTERNAL_LINK'>('ALL');
  const [sortDesc, setSortDesc] = useState(true);

  const { data: captures = [], isLoading } = useQuery({
    queryKey: ['captures', filter, sortDesc],
    queryFn: async () => {
      let query = supabase
        .from('captures')
        .select('*')
        .eq('user_id', user?.id);
      
      if (filter !== 'ALL') {
        query = query.eq('kind', filter);
      }
      
      query = query.order('created_at', { ascending: !sortDesc });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data as Capture[];
    },
    enabled: !!user?.id,
  });

  // Set up real-time subscription for capture updates
  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase
      .channel('feed-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'captures',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        // Invalidate the query to refetch data
        supabase.getQueryData(['captures', filter, sortDesc]);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, filter, sortDesc]);

  const toggleFilter = () => {
    if (filter === 'ALL') setFilter('THOUGHT');
    else if (filter === 'THOUGHT') setFilter('EXTERNAL_LINK');
    else setFilter('ALL');
  };

  const toggleSort = () => {
    setSortDesc(!sortDesc);
  };

  return (
    <>
      <Helmet>
        <title>Capture Feed | Aether Lite</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Helmet>
      
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Capture Feed</h2>
          <div className="flex space-x-2">
            <Button
              onClick={toggleFilter}
              variant="outline"
              className="flex items-center"
              size="sm"
            >
              <Filter className="mr-1 h-4 w-4" />
              {filter === 'ALL' ? 'All' : filter === 'THOUGHT' ? 'Thoughts' : 'Links'}
            </Button>
            <Button
              onClick={toggleSort}
              variant="outline"
              className="flex items-center"
              size="sm"
            >
              <SortDesc className={`mr-1 h-4 w-4 ${!sortDesc ? 'rotate-180' : ''}`} />
              {sortDesc ? 'Newest' : 'Oldest'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : captures.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-100 text-center">
            <div className="text-lg font-medium text-slate-700 mb-2">No captures found</div>
            <p className="text-slate-500 mb-4">Start by adding new thoughts or links using the Spark button.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {captures.map((capture) => (
              <CaptureCard key={capture.id} capture={capture} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
