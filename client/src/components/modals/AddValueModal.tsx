import { useState } from "react";
import { useModalStore, useAuthStore } from "@/lib/stores";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export default function AddValueModal() {
  const { isAddValueModalOpen, setAddValueModalOpen } = useModalStore();
  const { user } = useAuthStore();
  const [valueName, setValueName] = useState("");
  const [valueDescription, setValueDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSaveValue = async () => {
    if (!user) return;
    
    if (!valueName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your value",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('values')
        .insert({
          user_id: user.id,
          name: valueName.trim(),
          description: valueDescription.trim() || null,
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error("You already have a value with this name");
        }
        throw error;
      }

      toast({
        title: "Success!",
        description: `Your value "${valueName}" has been added.`,
      });

      // Reset form and close modal
      setValueName("");
      setValueDescription("");
      setAddValueModalOpen(false);
      
      // Invalidate values query
      queryClient.invalidateQueries({ queryKey: ['values'] });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save your value",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onOpenChange = (open: boolean) => {
    if (!open) {
      // Reset values when closing
      setValueName("");
      setValueDescription("");
    }
    setAddValueModalOpen(open);
  };

  return (
    <Dialog open={isAddValueModalOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Value</DialogTitle>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 absolute top-4 right-4" 
            onClick={() => setAddValueModalOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="valueName" className="block text-sm font-medium text-slate-700 mb-1">
              Value Name
            </label>
            <Input
              id="valueName"
              placeholder="e.g., Growth, Connection, Health"
              value={valueName}
              onChange={(e) => setValueName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="valueDescription" className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <Textarea
              id="valueDescription"
              placeholder="What does this value mean to you?"
              rows={4}
              value={valueDescription}
              onChange={(e) => setValueDescription(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex sm:justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => setAddValueModalOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveValue}
            disabled={isSubmitting}
          >
            Save Value
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
