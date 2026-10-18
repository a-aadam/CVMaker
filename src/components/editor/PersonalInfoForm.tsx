import { useProfile } from '../../store/profileStore';
import type { Personal } from '../../types';

const FIELDS: { key: keyof Personal; label: string; placeholder: string; type?: string; wide?: boolean }[] = [
  { key: 'fullName', label: 'Full name', placeholder: 'Jane Doe' },
  { key: 'headline', label: 'Headline', placeholder: 'Senior Data Analyst' },
  { key: 'email', label: 'Email', placeholder: 'jane@example.com', type: 'email' },
  { key: 'phone', label: 'Phone number', placeholder: '+1 555 123 4567', type: 'tel' },
  { key: 'address', label: 'Address / location', placeholder: 'Toronto, ON', wide: true },
  { key: 'linkedin', label: 'LinkedIn profile', placeholder: 'linkedin.com/in/janedoe' },
  { key: 'portfolio', label: 'Portfolio profile', placeholder: 'github.com/janedoe' },
  { key: 'website', label: 'Website', placeholder: 'janedoe.dev' },
];

export function PersonalInfoForm() {
  const personal = useProfile((s) => s.personal);
  const setPersonal = useProfile((s) => s.setPersonal);
  return (
    <section className="card" aria-labelledby="personal-h">
      <div className="card-head">
        <h3 id="personal-h" className="card-title-static">Personal information</h3>
      </div>
      <div className="grid-2">
        {FIELDS.map((f) => (
          <label key={f.key} className={`field${f.wide ? ' span-2' : ''}`}>
            <span>{f.label}</span>
            <input
              type={f.type ?? 'text'}
              value={personal[f.key]}
              placeholder={f.placeholder}
              onChange={(e) => setPersonal({ [f.key]: e.target.value })}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
