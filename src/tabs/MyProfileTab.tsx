import { useRef, useState } from 'react';
import { aiAvailable } from '../ai/engine';
import { ProfileEditor } from '../components/editor/ProfileEditor';
import { UploadIcon } from '../components/icons';
import { extractText } from '../parse/extractText';
import { parseCv } from '../parse/heuristicParser';
import { isProfileEmpty, useProfile } from '../store/profileStore';

type Notice = { tone: 'info' | 'ok' | 'error'; text: string } | null;

export function MyProfileTab() {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const replaceProfile = useProfile((s) => s.replaceProfile);
  const reset = useProfile((s) => s.reset);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const { personal, sections } = useProfile.getState();
    if (!isProfileEmpty({ personal, sections }) && !confirm('Replace your current profile with the details from this CV?')) return;
    setBusy(true);
    setNotice({ tone: 'info', text: `Reading ${file.name}…` });
    try {
      const text = await extractText(file);
      if (text.trim().length < 40) throw new Error("Couldn't find any text in this file. If it's a scanned image, try a DOCX or text-based PDF.");
      let profile = parseCv(text);
      replaceProfile(profile);
      let usedAi = false;
      if (await aiAvailable()) {
        try {
          const { parseCvWithAi } = await import('../parse/aiParser');
          profile = await parseCvWithAi(text, (msg) => setNotice({ tone: 'info', text: msg }));
          replaceProfile(profile);
          usedAi = true;
        } catch {
          /* rule-based result is already in place */
        }
      }
      setNotice({
        tone: 'ok',
        text: `Imported ${profile.sections.length} section${profile.sections.length === 1 ? '' : 's'}${usedAi ? ' with AI help' : ''}. Check each field below; everything is editable.`,
      });
    } catch (err) {
      setNotice({ tone: 'error', text: (err as Error).message || 'Something went wrong while reading the file.' });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="page page-narrow">
      <div className="upload-bar">
        <input
          ref={input}
          type="file"
          accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <button type="button" className="btn btn-primary btn-lg" disabled={busy} onClick={() => input.current?.click()}>
          <UploadIcon /> {busy ? 'Reading your CV…' : 'Upload CV from Device'}
        </button>
        <p className="muted small">PDF, DOCX or TXT. Your file is read in this browser and never uploaded anywhere.</p>
        {notice && (
          <p className={`notice ${notice.tone}`} role={notice.tone === 'error' ? 'alert' : 'status'}>
            {notice.text}
          </p>
        )}
      </div>

      <div className="page-head">
        <h2>My Profile</h2>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => confirm('Clear your whole profile? This cannot be undone.') && reset()}
        >
          Clear profile
        </button>
      </div>
      <ProfileEditor />
    </div>
  );
}
