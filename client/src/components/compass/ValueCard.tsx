import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ValueCardProps {
  value: {
    id: string;
    name: string;
    description: string | null;
    resonateCount?: number;
  };
}

export default function ValueCard({ value }: ValueCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [name, setName] = useState(value.name);
  const [description, setDescription] = useState(value.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpdate = async () => {
    if (!name.trim()) {
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
        .update({
          name: name.trim(),
          description: description.trim() || null,
        })
        .eq('id', value.id);

      if (error) {
        if (error.code === '23505') {
          throw new Error("You already have a value with this name");
        }
        throw error;
      }

      toast({
        title: "Success!",
        description: `Value "${name}" has been updated.`,
      });

      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['values'] });
      queryClient.invalidateQueries({ queryKey: ['mandalaData'] });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update value",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);

    try {
      // Check if there are any resonates using this value
      const { data: resonates, error: checkError } = await supabase
        .from('resonate')
        .select('id')
        .eq('value_id', value.id)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (resonates && resonates.length > 0) {
        throw new Error("Cannot delete a value that has resonates. Remove the resonates first.");
      }

      const { error } = await supabase
        .from('values')
        .delete()
        .eq('id', value.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Value "${value.name}" has been deleted.`,
      });

      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['values'] });
      queryClient.invalidateQueries({ queryKey: ['mandalaData'] });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete value",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="bg-white rounded-xl shadow-sm border border-slate-100">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{value.name}</CardTitle>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-slate-600 h-8 w-8"
                onClick={() => {
                  setName(value.name);
                  setDescription(value.description || "");
                  setIsEditModalOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-destructive h-8 w-8"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 text-sm">{value.description || "No description provided."}</p>
        </CardContent>
        <CardFooter>
          <div className="flex items-center">
            <span className="material-icons text-secondary mr-1 text-sm">waves</span>
            <span className="text-xs font-medium text-slate-500">
              {value.resonateCount || 0} resonance{value.resonateCount !== 1 ? 's' : ''}
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Value</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="valueName" className="block text-sm font-medium text-slate-700 mb-1">
                Value Name
              </label>
              <Input
                id="valueName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Growth, Connection, Health"
              />
            </div>
            <div>
              <label htmlFor="valueDescription" className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <Textarea
                id="valueDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this value mean to you?"
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={isSubmitting}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Value</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p>Are you sure you want to delete the value "{value.name}"?</p>
            <p className="text-sm text-slate-500 mt-2">
              This action cannot be undone if there are captures or actions associated with this value.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
