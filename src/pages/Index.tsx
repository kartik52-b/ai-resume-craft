import { ResumeProvider } from '@/context/ResumeContext';
import EditorPanel from '@/components/EditorPanel';
import PreviewPanel from '@/components/PreviewPanel';

const Index = () => {
  return (
    <ResumeProvider>
      <div className="app-shell h-screen flex overflow-hidden">
        {/* Editor - Left Pane */}
        <div className="app-editor w-[420px] min-w-[380px] shrink-0">
          <EditorPanel />
        </div>
        {/* Preview - Right Pane */}
        <div className="app-preview flex-1 min-w-0">
          <PreviewPanel />
        </div>
      </div>
    </ResumeProvider>
  );
};

export default Index;
