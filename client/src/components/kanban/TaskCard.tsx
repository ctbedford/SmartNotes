import { formatDate } from "@/lib/utils";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  isDone?: boolean;
}

export default function TaskCard({ task, isDone = false }: TaskCardProps) {
  const date = isDone ? task.updated_at : task.created_at;
  const dateLabel = isDone ? "Completed" : task.status === "DOING" ? "Started" : "Added";

  return (
    <div className={`${isDone ? 'bg-slate-50/50' : 'bg-slate-50'} p-4 rounded-lg border border-slate-200 cursor-grab shadow-sm hover:shadow-md transition-shadow`}>
      <h4 className={`font-medium ${isDone ? 'text-slate-700' : 'text-slate-800'}`}>
        {task.title}
      </h4>
      <div className="text-xs text-slate-500 mt-1">
        {dateLabel} {formatDate(date)}
      </div>
    </div>
  );
}
