import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { useModalStore, useAuthStore } from "@/lib/stores";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import ValueCard from "@/components/compass/ValueCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

interface Value {
  id: string;
  name: string;
  description: string | null;
  resonateCount?: number;
}

export default function Compass() {
  const { setAddValueModalOpen } = useModalStore();
  const { user } = useAuthStore();

  const { data: values = [], isLoading } = useQuery({
    queryKey: ['values'],
    queryFn: async () => {
      // First get the values
      const { data: valuesData, error: valuesError } = await supabase
        .from('values')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');
      
      if (valuesError) throw valuesError;
      
      // Then get the resonance counts for each value
      const { data: resonateData, error: resonateError } = await supabase
        .from('resonate')
        .select('value_id, id')
        .eq('user_id', user?.id);
        
      if (resonateError) throw resonateError;
      
      // Count resonates per value
      const resonateCounts: Record<string, number> = {};
      for (const resonate of resonateData) {
        resonateCounts[resonate.value_id] = (resonateCounts[resonate.value_id] || 0) + 1;
      }
      
      // Merge the counts with the values
      return valuesData.map(value => ({
        ...value,
        resonateCount: resonateCounts[value.id] || 0
      })) as Value[];
    },
    enabled: !!user?.id,
  });

  // Set up real-time subscription for value and resonate updates
  useEffect(() => {
    if (!user?.id) return;
    
    const valuesChannel = supabase
      .channel('values-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'values',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        supabase.getQueryData(['values']);
      })
      .subscribe();
      
    const resonateChannel = supabase
      .channel('resonate-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'resonate',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        supabase.getQueryData(['values']);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(valuesChannel);
      supabase.removeChannel(resonateChannel);
    };
  }, [user?.id]);

  return (
    <>
      <Helmet>
        <title>Value Compass | Aether Lite</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Helmet>
      
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Value Compass</h2>
          <Button
            onClick={() => setAddValueModalOpen(true)}
            className="flex items-center"
          >
            <span className="material-icons mr-1 text-sm">add</span>
            Add Value
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : values.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-100 text-center">
            <div className="text-lg font-medium text-slate-700 mb-2">No values found</div>
            <p className="text-slate-500 mb-4">Define your core values to align your actions and thoughts.</p>
            <Button onClick={() => setAddValueModalOpen(true)}>Add Your First Value</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <ValueCard key={value.id} value={value} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
