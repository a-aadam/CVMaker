import { useEffect, useRef, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import type { Profile } from '../types';
import { CvDocument } from './CvDocument';

export async function renderCvBlob(profile: Profile, size: 'A4' | 'LETTER'): Promise<Blob> {
  return pdf(<CvDocument profile={profile} size={size} />).toBlob();
}

/** Read-only preview: the real PDF, rasterised page by page with pdf.js so it looks the same everywhere. */
export function CvPreview({ profile, size }: { profile: Profile; size: 'A4' | 'LETTER' }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'rendering' | 'ready' | 'error'>('rendering');
  const [pages, setPages] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState('rendering');
    const t = setTimeout(async () => {
      try {
        const blob = await renderCvBlob(profile, size);
        if (cancelled) return;
        const pdfjs = await import('pdfjs-dist');
        const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        const task = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
        const doc = await task.promise;
        const el = host.current;
        if (cancelled || !el) return;
        const width = el.clientWidth || 600;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const canvases: HTMLCanvasElement[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (width / base.width) * ratio });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = 'preview-page';
          canvas.setAttribute('role', 'img');
          canvas.setAttribute('aria-label', `CV preview, page ${i} of ${doc.numPages}`);
          await page.render({ canvas, viewport }).promise;
          canvases.push(canvas);
        }
        await task.destroy();
        if (cancelled) return;
        el.replaceChildren(...canvases);
        setPages(canvases.length);
        setState('ready');
      } catch (err) {
        console.error(err);
        if (!cancelled) setState('error');
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [profile, size]);

  return (
    <div className="preview" aria-busy={state === 'rendering'}>
      <div className="preview-meta" role="status">
        {state === 'rendering' && <span className="spinner" aria-hidden />}
        {state === 'rendering'
          ? 'Updating preview…'
          : state === 'error'
            ? "The preview couldn't be drawn. Your PDF download still works."
            : `${pages} page${pages === 1 ? '' : 's'} · read-only preview`}
      </div>
      <div className="preview-pages" ref={host} />
    </div>
  );
}
