import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { useModalStore } from "@/lib/stores";

export default function Kanban() {
  const { setAddTaskModalOpen } = useModalStore();

  return (
    <>
      <Helmet>
        <title>Action Board | Aether Lite</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Helmet>
      
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Action Board</h2>
          <Button
            onClick={() => setAddTaskModalOpen(true)}
            className="flex items-center"
          >
            <span className="material-icons mr-1 text-sm">add</span>
            Add Task
          </Button>
        </div>

        <KanbanBoard />
      </div>
    </>
  );
}
