import { useResume } from '@/context/ResumeContext';
import { CloudUpload, Check, CloudOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SaveStatusIndicator = () => {
  const { saveStatus } = useResume();

  const config = {
    idle: { icon: CloudUpload, label: 'Not saved', className: 'text-muted-foreground' },
    saving: { icon: Loader2, label: 'Saving...', className: 'text-muted-foreground' },
    saved: { icon: Check, label: 'Saved', className: 'text-emerald-500' },
    error: { icon: CloudOff, label: 'Error', className: 'text-destructive' },
  }[saveStatus];

  const Icon = config.icon;

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors duration-200', config.className)}
      role="status"
      aria-live="polite"
    >
      {saveStatus === 'saved' ? (
        <span className="animate-save-success"><Check className="h-3.5 w-3.5" /></span>
      ) : (
        <Icon className={cn('h-3.5 w-3.5', saveStatus === 'saving' && 'animate-spin')} />
      )}
      {config.label}
    </span>
  );
};

export default SaveStatusIndicator;
