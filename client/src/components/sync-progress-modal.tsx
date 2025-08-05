import { useState, useEffect } from "react";
import { FolderSync, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SyncProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SyncProgressModal({ isOpen, onClose }: SyncProgressModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState("Fetching records from Notion...");
  const [processed, setProcessed] = useState(0);
  const [total] = useState(100);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setProcessed(0);
      setCurrentOperation("Fetching records from Notion...");
      return;
    }

    const operations = [
      "Fetching records from Notion...",
      "Processing record updates...",
      "Updating local cache...",
      "Finalizing synchronization..."
    ];

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15, 100);
        setProcessed(Math.floor((newProgress / 100) * total));
        
        // Update operation based on progress
        if (newProgress < 25) {
          setCurrentOperation(operations[0]);
        } else if (newProgress < 50) {
          setCurrentOperation(operations[1]);
        } else if (newProgress < 75) {
          setCurrentOperation(operations[2]);
        } else {
          setCurrentOperation(operations[3]);
        }

        // Auto-close when complete
        if (newProgress >= 100) {
          setTimeout(() => {
            onClose();
          }, 1000);
        }

        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen, onClose, total]);

  const eta = Math.max(0, Math.floor((100 - progress) * 0.3));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-4" data-testid="sync-progress-modal">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderSync className="text-primary w-8 h-8 animate-spin" data-testid="sync-icon" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="sync-title">Syncing Data</h3>
          <p className="text-muted-foreground mb-6" data-testid="sync-operation">
            {currentOperation}
          </p>
          
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
              data-testid="sync-progress-bar"
            ></div>
          </div>
          
          <div className="flex justify-between text-sm text-muted-foreground mb-6">
            <span data-testid="sync-progress-text">{processed} of {total} records</span>
            <span data-testid="sync-eta">ETA: {eta}s</span>
          </div>
          
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={progress >= 100}
            data-testid="button-cancel-sync"
          >
            {progress >= 100 ? "Complete" : "Cancel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
