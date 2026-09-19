import { ResumeProvider } from '@/context/ResumeContext';
import EditorPanel from '@/components/EditorPanel';
import PreviewPanel from '@/components/PreviewPanel';

const Index = () => {
  return (
    <ResumeProvider>
      <div className="h-screen flex overflow-hidden">
        {/* Editor - Left Pane */}
        <div className="w-[420px] min-w-[380px] shrink-0">
          <EditorPanel />
        </div>
        {/* Preview - Right Pane */}
        <div className="flex-1 min-w-0">
          <PreviewPanel />
        </div>
      </div>
    </ResumeProvider>
  );
};

export default Index;
