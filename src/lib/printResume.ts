import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { getTemplate } from '@/lib/templateRegistry';
import type { ResumeData } from '@/types/resume';

let activeCleanup: (() => void) | null = null;

/** Print the exact React template with A4 geometry; the browser can save it as a selectable-text PDF. */
export async function printResumePdf(resume: ResumeData): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof window.print !== 'function') {
    throw new Error('Printing is not available in this environment.');
  }

  activeCleanup?.();
  const template = getTemplate(resume.template);
  const host = document.createElement('div');
  host.id = 'resume-print-host';
  host.setAttribute('aria-hidden', 'true');
  Object.assign(host.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '210mm',
    minHeight: '297mm',
    padding: '18mm 20mm',
    boxSizing: 'border-box',
    background: '#fff',
  });

  const styles = document.createElement('style');
  styles.textContent = `
    @media print {
      @page { size: A4 portrait; margin: 0; }
      html, body { width: 210mm !important; min-height: 297mm !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; background: #fff !important; }
      body > *:not(#resume-print-host) { display: none !important; }
      #resume-print-host { display: block !important; position: relative !important; inset: auto !important; width: 210mm !important; min-height: 297mm !important; margin: 0 !important; padding: 18mm 20mm !important; overflow: visible !important; box-sizing: border-box !important; background: #fff !important; }
      #resume-print-host, #resume-print-host * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      #resume-print-host .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
      #resume-print-host .animate-fade-in { animation: none !important; }
    }
  `;
  document.head.append(styles);
  document.body.append(host);

  const root = createRoot(host);
  flushSync(() => root.render(createElement(template.Component, { data: resume })));

  const cleanup = () => {
    root.unmount();
    host.remove();
    styles.remove();
    window.removeEventListener('afterprint', cleanup);
    activeCleanup = null;
  };
  activeCleanup = cleanup;
  window.addEventListener('afterprint', cleanup, { once: true });

  if (document.fonts?.ready) await document.fonts.ready;
  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  window.print();
}
