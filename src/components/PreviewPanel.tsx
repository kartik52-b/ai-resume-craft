import { useRef, useCallback } from 'react';
import { useResume } from '@/context/ResumeContext';
import ModernTemplate from './templates/ModernTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import ProfessionalTemplate from './templates/ProfessionalTemplate';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const templateComponents = {
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  professional: ProfessionalTemplate,
};

const PreviewPanel = () => {
  const { resume } = useResume();
  const canvasRef = useRef<HTMLDivElement>(null);
  const Template = templateComponents[resume.template];

  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pdfWidth) / canvas.width;
      let renderedHeight = 0;
      let page = 0;
      while (renderedHeight < imageHeight) {
        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -renderedHeight, pdfWidth, imageHeight);
        renderedHeight += pdfHeight;
        page += 1;
      }
      pdf.save(`${resume.personal.fullName || 'Resume'}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch {
      toast.error('Failed to generate PDF');
    }
  }, [resume.personal.fullName]);

  return (
    <div className="h-full bg-workspace overflow-y-auto scrollbar-thin flex flex-col items-center py-8 px-4">
      {/* Toolbar */}
      <div className="w-full max-w-[680px] flex justify-between items-center mb-4">
        <span className="text-xs text-muted-foreground capitalize">{resume.template} template</span>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3.5 py-1.5 rounded-md text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Download className="h-3.5 w-3.5" />
          Download PDF
        </button>
      </div>

      {/* A4 Canvas */}
      <div
        ref={canvasRef}
        className="resume-canvas bg-canvas canvas-shadow rounded-sm origin-top"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '18mm 20mm',
          transform: 'scale(0.7)',
          transformOrigin: 'top center',
        }}
      >
        <Template data={resume} />
      </div>
    </div>
  );
};

export default PreviewPanel;
