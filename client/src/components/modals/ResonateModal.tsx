import { useState, useEffect } from "react";
import { useModalStore, useAuthStore } from "@/lib/stores";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export default function ResonateModal() {
  const { isResonateModalOpen, setResonateModalOpen, selectedCaptureForResonate } = useModalStore();
  const { user } = useAuthStore();
  const [selectedValueId, setSelectedValueId] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's values
  const { data: values = [] } = useQuery({
    queryKey: ['values'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('values')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && isResonateModalOpen,
  });

  // Reset the form when the modal opens/closes
  useEffect(() => {
    if (!isResonateModalOpen) {
      setSelectedValueId(null);
      setReflection("");
    }
  }, [isResonateModalOpen]);

  const handleSaveResonate = async () => {
    if (!user || !selectedCaptureForResonate || !selectedValueId) {
      toast({
        title: "Error",
        description: "Please select a value to resonate with",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert into resonate table
      const { data: resonateData, error: resonateError } = await supabase
        .from('resonate')
        .insert({
          user_id: user.id,
          capture_id: selectedCaptureForResonate.id,
          value_id: selectedValueId,
          reflection: reflection || null,
          xp_granted: 10,
        })
        .select();

      if (resonateError) throw resonateError;

      // Insert into xp_ledger
      const { error: xpError } = await supabase
        .from('xp_ledger')
        .insert({
          user_id: user.id,
          delta: 10,
          source_description: `Resonated with Value: ${values.find(v => v.id === selectedValueId)?.name}`,
          source_resonate_id: resonateData[0].id,
        });

      if (xpError) throw xpError;

      toast({
        title: "Success!",
        description: "Resonated successfully and earned 10 XP!",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['resonates'] });
      queryClient.invalidateQueries({ queryKey: ['xpLedger'] });
      queryClient.invalidateQueries({ queryKey: ['xpTotal'] });
      queryClient.invalidateQueries({ queryKey: ['mandalaData'] });
      
      // Close the modal
      setResonateModalOpen(false);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resonate",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const captureText = selectedCaptureForResonate?.body || selectedCaptureForResonate?.url || "";

  return (
    <Dialog open={isResonateModalOpen} onOpenChange={(open) => setResonateModalOpen(open)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Resonate with a Value</DialogTitle>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 absolute top-4 right-4" 
            onClick={() => setResonateModalOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
          <div className="text-sm text-slate-600 mb-1">You're resonating with:</div>
          <div className="text-slate-800">{captureText}</div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Choose a value</label>
          <div className="grid grid-cols-2 gap-2">
            {values.map((value) => (
              <Badge
                key={value.id}
                variant={selectedValueId === value.id ? "secondary" : "outline"}
                className={`py-2 text-center border ${
                  selectedValueId === value.id 
                    ? "border-secondary/30 bg-secondary/5 text-secondary" 
                    : "border-slate-200 hover:bg-secondary/5 hover:border-secondary/30 hover:text-secondary"
                } rounded-lg text-sm font-medium transition-colors cursor-pointer`}
                onClick={() => setSelectedValueId(value.id)}
              >
                {value.name}
              </Badge>
            ))}

            {values.length === 0 && (
              <div className="col-span-2 text-center py-4 text-slate-500">
                No values found. Create some in the Compass section.
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="reflection" className="block text-sm font-medium text-slate-700 mb-1">
            Add a reflection (optional)
          </label>
          <Textarea
            id="reflection"
            placeholder="Why does this spark connect with this value?"
            rows={3}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="resize-none"
          />
        </div>

        <DialogFooter className="flex sm:justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setResonateModalOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="secondary"
            onClick={handleSaveResonate}
            disabled={isSubmitting || !selectedValueId}
          >
            Resonate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
