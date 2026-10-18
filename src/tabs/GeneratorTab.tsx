import { useMemo, useState } from 'react';
import { ProfileEditor } from '../components/editor/ProfileEditor';
import { DownloadIcon } from '../components/icons';
import { CvPreview, renderCvBlob } from '../pdf/CvPreview';
import { useProfile } from '../store/profileStore';

type Size = 'A4' | 'LETTER';
const SIZE_KEY = 'cvmaker.pageSize';

function readSize(): Size {
  try {
    return localStorage.getItem(SIZE_KEY) === 'LETTER' ? 'LETTER' : 'A4';
  } catch {
    return 'A4';
  }
}

export function GeneratorTab() {
  const personal = useProfile((s) => s.personal);
  const sections = useProfile((s) => s.sections);
  const profile = useMemo(() => ({ personal, sections }), [personal, sections]);
  const [size, setSize] = useState<Size>(readSize);
  const [downloading, setDownloading] = useState(false);

  const onSize = (v: Size) => {
    setSize(v);
    try {
      localStorage.setItem(SIZE_KEY, v);
    } catch {
      /* storage unavailable */
    }
  };

  const download = async () => {
    setDownloading(true);
    try {
      const blob = await renderCvBlob(profile, size);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const name = personal.fullName.trim().replace(/[^\p{L}\p{N}]+/gu, '_') || 'My';
      a.href = url;
      a.download = `${name}_CV.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page gen-layout">
      <div>
        <div className="page-head">
          <h2>Profile details</h2>
          <span className="muted small">Synced with My Profile. Reorder the CV by dragging a card's handle or with its up and down arrows.</span>
        </div>
        <ProfileEditor />
      </div>
      <aside className="gen-right" aria-labelledby="preview-h">
        <section className="card preview-card">
          <div className="card-head">
            <h2 id="preview-h" className="card-title-static">
              CV preview
            </h2>
            <label className="field inline small">
              <span className="sr-only">Page size</span>
              <select value={size} onChange={(e) => onSize(e.target.value as Size)} aria-label="Page size">
                <option value="A4">A4</option>
                <option value="LETTER">US Letter</option>
              </select>
            </label>
          </div>
          <div className="card-body">
            <CvPreview profile={profile} size={size} />
            <button type="button" className="btn btn-primary btn-lg btn-block" onClick={download} disabled={downloading}>
              {downloading ? <span className="spinner" aria-hidden /> : <DownloadIcon />}
              {downloading ? 'Preparing PDF…' : 'Download PDF'}
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}
