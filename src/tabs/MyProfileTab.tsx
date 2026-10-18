import { useRef, useState } from 'react';
import { aiAvailable } from '../ai/engine';
import { ProfileEditor } from '../components/editor/ProfileEditor';
import { AlertIcon, CheckIcon, InfoIcon, UploadIcon } from '../components/icons';
import { extractText } from '../parse/extractText';
import { parseCv } from '../parse/heuristicParser';
import { isProfileEmpty, useProfile } from '../store/profileStore';

type Notice = { tone: 'info' | 'ok' | 'error'; text: string } | null;

export function MyProfileTab() {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const replaceProfile = useProfile((s) => s.replaceProfile);
  const reset = useProfile((s) => s.reset);

  const onFile = async (file: File | undefined) => {
    if (!file || busy) return;
    const { personal, sections } = useProfile.getState();
    if (!isProfileEmpty({ personal, sections }) && !confirm('Replace your current profile with the details from this CV?')) return;
    setBusy(true);
    setNotice({ tone: 'info', text: `Reading ${file.name}…` });
    try {
      const text = await extractText(file);
      if (text.trim().length < 40) {
        throw new Error("This file has almost no readable text. If it's a scanned image, try the DOCX version or a text-based PDF.");
      }
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
      const n = profile.sections.length;
      setNotice({
        tone: 'ok',
        text: `Filed ${n} section${n === 1 ? '' : 's'} from ${file.name}${usedAi ? ' with AI help' : ''}. Check each card below; every field is editable.`,
      });
    } catch (err) {
      setNotice({ tone: 'error', text: (err as Error).message || "Couldn't read that file. Try a PDF, DOCX or TXT." });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const NoticeIcon = notice?.tone === 'error' ? AlertIcon : notice?.tone === 'ok' ? CheckIcon : InfoIcon;

  return (
    <div className="page page-narrow">
      <div
          className={`upload profile-upload${dragOver ? ' drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onFile(e.dataTransfer.files?.[0]);
          }}
        >
          <input
            ref={input}
            type="file"
            accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            hidden
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <div className="upload-row">
            <button type="button" className="btn btn-primary btn-lg" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? <span className="spinner" aria-hidden /> : <UploadIcon />}
              {busy ? 'Reading your CV…' : 'Upload CV from device'}
            </button>
            <p className="muted small">
              PDF, DOCX or TXT, or drop the file here. It's read in this browser and never uploaded.
            </p>
          </div>
          {notice && (
            <p className={`notice ${notice.tone}`} role={notice.tone === 'error' ? 'alert' : 'status'}>
              <NoticeIcon />
              <span>{notice.text}</span>
            </p>
          )}
      </div>
      <div>
        <div className="page-head">
          <h2>My Profile</h2>
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => confirm('Clear your whole profile? This cannot be undone.') && reset()}
          >
            Clear profile
          </button>
        </div>
        <ProfileEditor />
      </div>
    </div>
  );
}
