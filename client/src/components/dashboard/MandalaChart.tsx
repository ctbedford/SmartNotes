import { useAuthStore } from "@/lib/stores";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveRadar } from "@nivo/radar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { isDemoMode, getMockMandalaData } from "@/lib/demoData";

interface MandalaDataPoint {
  value_name: string;
  resonate_count: number;
}

export default function MandalaChart() {
  const { user } = useAuthStore();
  const isDemo = isDemoMode();

  const { data: mandalaData, isLoading, error } = useQuery({
    queryKey: ['mandalaData'],
    queryFn: async () => {
      // For demo mode, return mock data
      if (isDemo) {
        return getMockMandalaData();
      }
      
      // Query the mandala_data view with real Supabase data
      const { data, error } = await supabase
        .from('mandala_data')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      // Transform the data for Nivo radar chart
      const transformedData = data.map(item => ({
        value_name: item.value_name,
        resonate_count: item.resonate_count
      }));
      
      return transformedData;
    },
    enabled: !!user?.id,
  });

  // Set up real-time subscription for updates (not for demo mode)
  useEffect(() => {
    if (!user?.id || isDemo) return;
    
    const channel = supabase
      .channel('mandala-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'resonate',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        // Use react-query's queryClient to invalidate instead of supabase method
        // This will trigger a refresh of the data
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isDemo]);

  // Format data for Nivo radar chart
  const chartData = mandalaData?.length
    ? [
        mandalaData.reduce((obj, item) => {
          obj[item.value_name] = item.resonate_count;
          return obj;
        }, { name: "Values" }),
      ]
    : [];

  const keys = mandalaData?.map(item => item.value_name) || [];

  return (
    <Card className="bg-white rounded-xl shadow-md border border-slate-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Your Value Mandala</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 w-full flex items-center justify-center">
            <Skeleton className="h-64 w-64 rounded-full" />
          </div>
        ) : error ? (
          <div className="h-80 w-full flex items-center justify-center text-destructive">
            Error loading mandala data
          </div>
        ) : mandalaData?.length === 0 ? (
          <div className="h-80 w-full flex items-center justify-center text-slate-500 text-center">
            <div>
              <p className="mb-2">Your mandala is empty</p>
              <p className="text-sm">Add values in the Compass section and resonate with them to see your mandala grow.</p>
            </div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveRadar
              data={chartData}
              keys={keys}
              indexBy="name"
              valueFormat=">-.2f"
              margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
              borderColor={{ from: 'color' }}
              gridLabelOffset={36}
              dotSize={10}
              dotColor={{ theme: 'background' }}
              dotBorderWidth={2}
              colors={{ scheme: 'category10' }}
              blendMode="multiply"
              motionConfig="gentle"
              legends={[]}
              gridShape="circular"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
