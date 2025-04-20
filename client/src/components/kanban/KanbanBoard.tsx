import { useAuthStore } from "@/lib/stores";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import TaskCard from "./TaskCard";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'DOING' | 'DONE';
  created_at: string;
  updated_at: string;
}

export default function KanbanBoard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [doingTasks, setDoingTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as Task[];
    },
    enabled: !!user?.id,
  });

  // Group tasks by status whenever the data changes
  useEffect(() => {
    if (tasks) {
      setTodoTasks(tasks.filter(task => task.status === 'TODO'));
      setDoingTasks(tasks.filter(task => task.status === 'DOING'));
      setDoneTasks(tasks.filter(task => task.status === 'DONE'));
    }
  }, [tasks]);

  // Set up real-time subscription for task updates
  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase
      .channel('actions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'actions',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['actions'] });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Return if dropped outside a droppable area or in the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Determine the new status based on the destination droppableId
    const newStatus = destination.droppableId as 'TODO' | 'DOING' | 'DONE';
    
    // Find the task that was dragged
    const allTasks = [...todoTasks, ...doingTasks, ...doneTasks];
    const draggedTask = allTasks.find(task => task.id === draggableId);
    
    if (!draggedTask || draggedTask.status === newStatus) return;

    // Optimistic update
    const oldStatus = draggedTask.status;
    
    // Update the local state first (optimistic update)
    const updatedTask = { ...draggedTask, status: newStatus };
    
    // Remove from old list
    if (oldStatus === 'TODO') {
      setTodoTasks(prev => prev.filter(t => t.id !== draggableId));
    } else if (oldStatus === 'DOING') {
      setDoingTasks(prev => prev.filter(t => t.id !== draggableId));
    } else {
      setDoneTasks(prev => prev.filter(t => t.id !== draggableId));
    }
    
    // Add to new list
    if (newStatus === 'TODO') {
      setTodoTasks(prev => [...prev, updatedTask]);
    } else if (newStatus === 'DOING') {
      setDoingTasks(prev => [...prev, updatedTask]);
    } else {
      setDoneTasks(prev => [...prev, updatedTask]);
    }
    
    try {
      // Update the task in the database
      const { error } = await supabase
        .from('actions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', draggableId);
        
      if (error) throw error;
      
      // If moved to DONE, grant XP
      if (newStatus === 'DONE' && oldStatus !== 'DONE') {
        const { error: xpError } = await supabase
          .from('xp_ledger')
          .insert({
            user_id: user?.id,
            delta: 10,
            source_description: `Completed Action: ${draggedTask.title}`,
            source_action_id: draggedTask.id,
          });
          
        if (xpError) throw xpError;
        
        toast({
          title: "Task completed!",
          description: "You earned 10 XP for completing this task.",
        });
        
        // Invalidate XP queries
        queryClient.invalidateQueries({ queryKey: ['xpLedger'] });
        queryClient.invalidateQueries({ queryKey: ['xpTotal'] });
      }
      
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
      
      // Revert the local state on error
      queryClient.invalidateQueries({ queryKey: ['actions'] });
    }
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[0, 1, 2].map((column) => (
        <div key={column} className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TODO Column */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
          <h3 className="font-medium text-slate-700 mb-4 flex items-center">
            <span className="material-icons mr-2 text-sm text-slate-400">radio_button_unchecked</span>
            To Do
            <span className="ml-2 bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              {todoTasks.length}
            </span>
          </h3>
          
          <Droppable droppableId="TODO">
            {(provided) => (
              <div 
                className="space-y-3" 
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {todoTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard task={task} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                
                {todoTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No tasks yet
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </div>
        
        {/* DOING Column */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
          <h3 className="font-medium text-slate-700 mb-4 flex items-center">
            <span className="material-icons mr-2 text-sm text-warning">pending</span>
            Doing
            <span className="ml-2 bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              {doingTasks.length}
            </span>
          </h3>
          
          <Droppable droppableId="DOING">
            {(provided) => (
              <div 
                className="space-y-3" 
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {doingTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard task={task} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                
                {doingTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No tasks in progress
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </div>
        
        {/* DONE Column */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
          <h3 className="font-medium text-slate-700 mb-4 flex items-center">
            <span className="material-icons mr-2 text-sm text-success">task_alt</span>
            Done
            <span className="ml-2 bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              {doneTasks.length}
            </span>
          </h3>
          
          <Droppable droppableId="DONE">
            {(provided) => (
              <div 
                className="space-y-3" 
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {doneTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard task={task} isDone />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                
                {doneTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No completed tasks
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </DragDropContext>
  );
}
