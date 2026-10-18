import { Document, Font, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Entry, Profile, Section } from '../types';
import { formatRange, SECTION_META } from '../sections';

// Don't hyphenate words across lines; it hurts ATS parsing.
Font.registerHyphenationCallback((word) => [word]);

const ACCENT = '#1f4e79';

const s = StyleSheet.create({
  page: { paddingVertical: 36, paddingHorizontal: 42, fontFamily: 'Helvetica', fontSize: 10, lineHeight: 1.35, color: '#1d1d1f' },
  name: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: ACCENT, textAlign: 'center' },
  headline: { fontSize: 11, textAlign: 'center', marginTop: 2, color: '#444' },
  contact: { fontSize: 9, textAlign: 'center', marginTop: 4, color: '#444' },
  link: { color: '#444', textDecoration: 'none' },
  section: { marginTop: 12 },
  heading: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    borderBottomWidth: 0.8,
    borderBottomColor: ACCENT,
    paddingBottom: 2,
    marginBottom: 5,
  },
  entry: { marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontFamily: 'Helvetica-Bold', flexGrow: 1, flexShrink: 1, flexBasis: 0, paddingRight: 8 },
  org: { fontFamily: 'Helvetica-Oblique', flexGrow: 1, flexShrink: 1, flexBasis: 0, paddingRight: 8, color: '#333' },
  meta: { color: '#555', flexGrow: 0, flexShrink: 0, textAlign: 'right' },
  desc: { marginTop: 1, color: '#333' },
  bullet: { flexDirection: 'row', marginTop: 1.5, paddingLeft: 4 },
  dot: { width: 10 },
  bulletText: { flex: 1 },
  para: { textAlign: 'left' },
});

const clean = (v: string) => v.trim();
const hasContent = (sec: Section) => {
  const kind = SECTION_META[sec.type].kind;
  if (kind === 'text') return !!sec.text.trim();
  if (kind === 'skills') return sec.skills.some((x) => x.trim());
  return sec.entries.some((e) => e.title.trim() || e.organization.trim() || e.bullets.some((b) => b.trim()));
};

function linkHref(v: string) {
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function EntryBlock({ e, section }: { e: Entry; section: Section }) {
  const dates = formatRange(e, section.dateMode);
  const location = section.showLocation ? clean(e.location) : '';
  const bullets = e.bullets.map(clean).filter(Boolean);
  return (
    <View style={s.entry} wrap={bullets.length > 4}>
      <View style={s.row}>
        <Text style={s.title}>{clean(e.title) || clean(e.organization)}</Text>
        {!!dates && <Text style={s.meta}>{dates}</Text>}
      </View>
      {(clean(e.title) && clean(e.organization)) || location ? (
        <View style={s.row}>
          <Text style={s.org}>{clean(e.title) ? clean(e.organization) : ''}</Text>
          {!!location && <Text style={s.meta}>{location}</Text>}
        </View>
      ) : null}
      {!!clean(e.description) && <Text style={s.desc}>{clean(e.description)}</Text>}
      {bullets.map((b, i) => (
        <View key={i} style={s.bullet}>
          <Text style={s.dot}>•</Text>
          <Text style={s.bulletText}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

export function CvDocument({ profile, size }: { profile: Profile; size: 'A4' | 'LETTER' }) {
  const p = profile.personal;
  const contact = [p.email, p.phone, p.address, p.linkedin, p.portfolio, p.website].map(clean).filter(Boolean);
  const sections = profile.sections.filter((x) => x.visible && hasContent(x));
  return (
    <Document title={p.fullName ? `${p.fullName} CV` : 'CV'} author={p.fullName || undefined} creator="CVMaker" producer="CVMaker">
      <Page size={size} style={s.page}>
        {!!clean(p.fullName) && <Text style={s.name}>{clean(p.fullName)}</Text>}
        {!!clean(p.headline) && <Text style={s.headline}>{clean(p.headline)}</Text>}
        {contact.length > 0 && (
          <Text style={s.contact}>
            {contact.map((c, i) => (
              <Text key={i}>
                {i > 0 ? '  |  ' : ''}
                {/linkedin|github|\.\w{2,}\//i.test(c) || c === clean(p.website) ? (
                  <Link src={linkHref(c)} style={s.link}>
                    {c}
                  </Link>
                ) : (
                  c
                )}
              </Text>
            ))}
          </Text>
        )}
        {sections.map((sec) => {
          const kind = SECTION_META[sec.type].kind;
          return (
            <View key={sec.id} style={s.section}>
              <Text style={s.heading} minPresenceAhead={30}>
                {sec.title}
              </Text>
              {kind === 'text' && <Text style={s.para}>{sec.text.trim()}</Text>}
              {kind === 'skills' && <Text style={s.para}>{sec.skills.map(clean).filter(Boolean).join(' • ')}</Text>}
              {kind === 'entries' &&
                sec.entries
                  .filter((e) => e.title.trim() || e.organization.trim() || e.bullets.some((b) => b.trim()))
                  .map((e) => <EntryBlock key={e.id} e={e} section={sec} />)}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
