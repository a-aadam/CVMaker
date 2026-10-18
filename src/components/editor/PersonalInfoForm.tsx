import { useProfile } from '../../store/profileStore';
import type { Personal } from '../../types';

const FIELDS: { key: keyof Personal; label: string; placeholder: string; type?: string; auto?: string; wide?: boolean }[] = [
  { key: 'fullName', label: 'Full name', placeholder: 'e.g. Jane Doe', auto: 'name' },
  { key: 'headline', label: 'Headline', placeholder: 'e.g. Senior Data Analyst', auto: 'organization-title' },
  { key: 'email', label: 'Email', placeholder: 'e.g. jane@example.com', type: 'email', auto: 'email' },
  { key: 'phone', label: 'Phone number', placeholder: 'e.g. +1 555 123 4567', type: 'tel', auto: 'tel' },
  { key: 'address', label: 'Address or location', placeholder: 'e.g. Toronto, ON', auto: 'address-level2', wide: true },
  { key: 'linkedin', label: 'LinkedIn profile', placeholder: 'e.g. linkedin.com/in/janedoe', auto: 'url' },
  { key: 'portfolio', label: 'Portfolio profile', placeholder: 'e.g. github.com/janedoe', auto: 'url' },
  { key: 'website', label: 'Website', placeholder: 'e.g. yourname.dev', auto: 'url' },
];

export function PersonalInfoForm() {
  const personal = useProfile((s) => s.personal);
  const setPersonal = useProfile((s) => s.setPersonal);
  return (
    <section className="card" id="section-personal" aria-labelledby="personal-h">
      <div className="card-head">
        <h3 id="personal-h" className="card-title-static">
          Personal information
        </h3>
      </div>
      <div className="card-body">
        <div className="grid-2">
          {FIELDS.map((f) => (
            <label key={f.key} className={`field${f.wide ? ' span-2' : ''}`}>
              <span>{f.label}</span>
              <input
                type={f.type ?? 'text'}
                value={personal[f.key]}
                placeholder={f.placeholder}
                autoComplete={f.auto}
                onChange={(e) => setPersonal({ [f.key]: e.target.value })}
              />
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
