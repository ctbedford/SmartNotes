import { useState } from "react";
import { useModalStore } from "@/lib/stores";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function SparkModal() {
  const { isSparkModalOpen, setSparkModalOpen } = useModalStore();
  const [captureType, setCaptureType] = useState<"THOUGHT" | "EXTERNAL_LINK">("THOUGHT");
  const [thought, setThought] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!user) return;
    
    if ((captureType === "THOUGHT" && !thought) || (captureType === "EXTERNAL_LINK" && !url)) {
      toast({
        title: "Input required",
        description: captureType === "THOUGHT" ? "Please enter a thought" : "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('captures')
        .insert({
          user_id: user.id,
          kind: captureType,
          body: captureType === "THOUGHT" ? thought : null,
          url: captureType === "EXTERNAL_LINK" ? url : null,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Your ${captureType.toLowerCase()} has been captured.`,
      });

      // Reset and close modal
      setThought("");
      setUrl("");
      setCaptureType("THOUGHT");
      setSparkModalOpen(false);
      
      // Invalidate queries that depend on captures
      queryClient.invalidateQueries({ queryKey: ['captures'] });
      queryClient.invalidateQueries({ queryKey: ['recentCaptures'] });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save your capture",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onOpenChange = (open: boolean) => {
    if (!open) {
      // Reset values when closing
      setThought("");
      setUrl("");
      setCaptureType("THOUGHT");
    }
    setSparkModalOpen(open);
  };

  return (
    <Dialog open={isSparkModalOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New Spark</DialogTitle>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 absolute top-4 right-4" 
            onClick={() => setSparkModalOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex rounded-lg border border-slate-200 p-1 mb-4 bg-slate-50">
          <button 
            onClick={() => setCaptureType("THOUGHT")} 
            className={`flex-1 py-2 px-3 rounded-md flex justify-center items-center text-sm font-medium ${
              captureType === "THOUGHT" 
                ? "bg-white shadow-sm border border-slate-200" 
                : "text-slate-600"
            }`}
          >
            <span className="material-icons mr-1 text-sm">lightbulb</span>
            Thought
          </button>
          <button 
            onClick={() => setCaptureType("EXTERNAL_LINK")} 
            className={`flex-1 py-2 px-3 rounded-md flex justify-center items-center text-sm font-medium ${
              captureType === "EXTERNAL_LINK" 
                ? "bg-white shadow-sm border border-slate-200" 
                : "text-slate-600"
            }`}
          >
            <span className="material-icons mr-1 text-sm">link</span>
            Link
          </button>
        </div>

        {captureType === "THOUGHT" ? (
          <div>
            <label htmlFor="thoughtText" className="block text-sm font-medium text-slate-700 mb-1">
              Capture your thought
            </label>
            <Textarea
              id="thoughtText"
              placeholder="What's on your mind?"
              rows={5}
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              className="resize-none"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="linkUrl" className="block text-sm font-medium text-slate-700 mb-1">
              Paste URL
            </label>
            <Input
              id="linkUrl"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        )}

        <DialogFooter className="flex sm:justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => setSparkModalOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSubmitting}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
