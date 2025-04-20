import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useModalStore } from "@/lib/stores";

interface CaptureCardProps {
  capture: {
    id: string;
    kind: 'THOUGHT' | 'EXTERNAL_LINK';
    body: string | null;
    url: string | null;
    created_at: string;
  };
}

export default function CaptureCard({ capture }: CaptureCardProps) {
  const { setResonateModalOpen } = useModalStore();

  const handleResonate = () => {
    setResonateModalOpen(true, capture);
  };

  const handleToTask = () => {
    // For future implementation
    console.log("Convert to task", capture.id);
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-100">
      <CardHeader className="p-6 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-slate-400">
              {capture.kind === 'THOUGHT' ? 'lightbulb' : 'link'}
            </span>
            <span className="text-sm font-medium text-slate-500">
              {capture.kind === 'THOUGHT' ? 'Thought' : 'Link'}
            </span>
          </div>
          <div className="text-xs text-slate-400">{formatDate(capture.created_at)}</div>
        </div>
      </CardHeader>
      <CardContent className="p-6 py-3">
        {capture.kind === 'THOUGHT' ? (
          <p className="text-slate-800">{capture.body}</p>
        ) : (
          <div>
            <a 
              href={capture.url || "#"} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              {capture.url}
            </a>
            {/* Link preview would go here in a future implementation */}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0 flex space-x-2">
        <Button
          onClick={handleResonate}
          variant="outline"
          className="text-secondary border border-secondary/30 bg-secondary/5 hover:bg-secondary/10 flex items-center"
        >
          <span className="material-icons mr-1 text-sm">waves</span>
          Resonate
        </Button>
        <Button
          onClick={handleToTask}
          variant="outline"
          className="text-slate-600 border border-slate-200 hover:bg-slate-50 flex items-center"
        >
          <span className="material-icons mr-1 text-sm">add_task</span>
          To Task
        </Button>
      </CardFooter>
    </Card>
  );
}
