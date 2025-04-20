import { useState } from "react";
import { useModalStore, useAuthStore } from "@/lib/stores";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export default function AddTaskModal() {
  const { isAddTaskModalOpen, setAddTaskModalOpen } = useModalStore();
  const { user } = useAuthStore();
  const [taskTitle, setTaskTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSaveTask = async () => {
    if (!user) return;
    
    if (!taskTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your task",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('actions')
        .insert({
          user_id: user.id,
          title: taskTitle.trim(),
          status: 'TODO',
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Your task "${taskTitle}" has been added.`,
      });

      // Reset form and close modal
      setTaskTitle("");
      setAddTaskModalOpen(false);
      
      // Invalidate tasks query
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save your task",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onOpenChange = (open: boolean) => {
    if (!open) {
      // Reset values when closing
      setTaskTitle("");
    }
    setAddTaskModalOpen(open);
  };

  return (
    <Dialog open={isAddTaskModalOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Task</DialogTitle>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 absolute top-4 right-4" 
            onClick={() => setAddTaskModalOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div>
          <label htmlFor="taskTitle" className="block text-sm font-medium text-slate-700 mb-1">
            Task Title
          </label>
          <Input
            id="taskTitle"
            placeholder="What needs to be done?"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
        </div>

        <DialogFooter className="flex sm:justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => setAddTaskModalOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTask}
            disabled={isSubmitting}
          >
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
