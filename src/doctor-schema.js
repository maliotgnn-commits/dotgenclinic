import { getDoctorProfileCompleted, isDoctorProfileComplete, MISSING_DATA } from './doctors-data.js';

const SITE_ORIGIN = 'https://www.drotgenclinic.com';

export function doctorPageUrl(slug, locale) {
  const params = new URLSearchParams();
  if (slug) params.set('slug', slug);
  const query = params.toString();
  return `${SITE_ORIGIN}/${locale}/doctor.html${query ? `?${query}` : ''}`;
}

export function doctorSchemaId(slug) {
  return `${doctorPageUrl(slug, 'tr')}#physician`;
}

export function canEmitDoctorSchema(doctor) {
  return getDoctorProfileCompleted(doctor);
}

function verifiedText(value) {
  if (!value || value === MISSING_DATA) return null;
  return String(value).trim() || null;
}

function verifiedCongressText(doctor) {
  return verifiedText(doctor.congresses) || verifiedText(doctor.conferences);
}

/**
 * Returns JSON-LD graph nodes or null when profile is not verified/indexable.
 * Physician + Person are only emitted with clinic-verified fields.
 */
export function buildDoctorSchemaGraph(doctor, locale) {
  if (!canEmitDoctorSchema(doctor)) return null;

  const pageUrl = doctorPageUrl(doctor.slug, locale);
  const orgId = `${SITE_ORIGIN}/#organization`;
  const physicianId = `${pageUrl}#physician`;
  const personId = `${pageUrl}#person`;
  const photo = doctor.photo || doctor.image;

  const credentialFields = {
    education: verifiedText(doctor.education),
    experience: verifiedText(doctor.experience),
    interests: verifiedText(doctor.interests),
    publications: verifiedText(doctor.publications),
    congresses: verifiedCongressText(doctor),
    memberships: verifiedText(doctor.memberships),
    certifications: verifiedText(doctor.certifications),
    approach: verifiedText(doctor.approach),
  };

  const descriptionParts = [
    credentialFields.education,
    credentialFields.experience,
    credentialFields.interests,
  ].filter(Boolean);

  const physician = {
    '@type': 'Physician',
    '@id': physicianId,
    name: doctor.name,
    jobTitle: doctor.title,
    medicalSpecialty: doctor.specialty,
    image: photo?.startsWith('http') ? photo : `${SITE_ORIGIN}${photo}`,
    url: pageUrl,
    worksFor: { '@id': orgId },
    ...(descriptionParts.length ? { description: descriptionParts.join(' ') } : {}),
    ...(credentialFields.certifications ? { hasCredential: credentialFields.certifications } : {}),
  };

  const person = {
    '@type': 'Person',
    '@id': personId,
    name: doctor.name,
    jobTitle: doctor.title,
    url: pageUrl,
    worksFor: { '@id': orgId },
    ...(credentialFields.education ? { alumniOf: credentialFields.education } : {}),
    ...(credentialFields.memberships ? { memberOf: credentialFields.memberships } : {}),
    sameAs: [],
  };

  return [physician, person];
}

export function applyDoctorSchema(doctor, locale) {
  const graph = buildDoctorSchemaGraph(doctor, locale);
  const existing = document.querySelector('script[data-doctor-schema="true"]');
  if (existing) existing.remove();
  if (!graph) return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-doctor-schema', 'true');
  script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  document.head.appendChild(script);
}
