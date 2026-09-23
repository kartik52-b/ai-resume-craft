import { type ResumeData } from '@/types/resume';
import { getTemplate } from '@/lib/templateRegistry';

/**
 * Miniature A4 rendering of a resume, scaled to fit its parent.
 *
 * The parent must be `relative` and size the thumbnail (aspect ratio or fixed
 * height). Whatever `data` is passed renders exactly as it would in the live
 * preview — pass the user's own resume to show their real content, or
 * `getSampleResume()` for design-only previews.
 */
export default function ResumeThumbnail({ data }: { data: ResumeData }) {
  const Template = getTemplate(data.template).Component;
  return (
    <div className="absolute inset-0 overflow-hidden bg-white pointer-events-none select-none">
      <div
        style={{
          width: '286%',
          height: '286%',
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'scale(0.35)',
          transformOrigin: 'top left',
        }}
      >
        {/* Proportional A4 page padding (18mm × 297mm / 20mm × 210mm) so the
            thumbnail frames content exactly like the full-size preview. */}
        <div style={{ padding: '8.57% 9.52%' }}>
          <Template data={data} />
        </div>
      </div>
    </div>
  );
}
