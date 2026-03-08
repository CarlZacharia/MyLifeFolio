/**
 * Assembles obituary data into a natural, template-based text format.
 * No AI involved — simply formats the entered fields with appropriate prefixes.
 */

interface ObituaryFields {
  preferredName: string;
  nicknames: string;
  dateOfBirth: string;
  placeOfBirth: string;
  dateOfDeath: string;
  placeOfDeath: string;
  hometowns: string;
  religiousAffiliation: string;
  militaryService: string;
  education: string;
  careerHighlights: string;
  communityInvolvement: string;
  awardsHonors: string;
  spouses: string;
  children: string;
  grandchildren: string;
  siblings: string;
  parents: string;
  othersToMention: string;
  precededInDeath: string;
  tone: string;
  quotesToInclude: string;
  whatToRemember: string;
  personalMessage: string;
  preferredFuneralHome: string;
  burialOrCremation: string;
  servicePreferences: string;
  charitableDonations: string;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function buildObituaryFromTemplate(fields: ObituaryFields): string {
  const lines: string[] = [];
  const name = fields.preferredName || 'Name not provided';

  // ── Opening line ──
  if (fields.dateOfDeath && fields.placeOfDeath) {
    lines.push(`${name} passed away on ${formatDate(fields.dateOfDeath)} in ${fields.placeOfDeath}.`);
  } else if (fields.dateOfDeath) {
    lines.push(`${name} passed away on ${formatDate(fields.dateOfDeath)}.`);
  } else {
    lines.push(name);
  }

  // ── Nicknames ──
  if (fields.nicknames) {
    lines.push(`Also known as ${fields.nicknames}.`);
  }

  // ── Birth ──
  if (fields.dateOfBirth && fields.placeOfBirth) {
    lines.push(`Born on ${formatDate(fields.dateOfBirth)} in ${fields.placeOfBirth}.`);
  } else if (fields.dateOfBirth) {
    lines.push(`Born on ${formatDate(fields.dateOfBirth)}.`);
  } else if (fields.placeOfBirth) {
    lines.push(`Born in ${fields.placeOfBirth}.`);
  }

  // ── Hometowns ──
  if (fields.hometowns) {
    lines.push(`Hometown: ${fields.hometowns}.`);
  }

  lines.push(''); // blank line separator

  // ── Life Story section ──
  if (fields.religiousAffiliation) {
    lines.push(`${fields.religiousAffiliation}.`);
  }

  if (fields.militaryService) {
    lines.push(`Military service: ${fields.militaryService}.`);
  }

  if (fields.education) {
    lines.push(`Education: ${fields.education}.`);
  }

  if (fields.careerHighlights) {
    lines.push(`Career: ${fields.careerHighlights}.`);
  }

  if (fields.communityInvolvement) {
    lines.push(`Community involvement: ${fields.communityInvolvement}.`);
  }

  if (fields.awardsHonors) {
    lines.push(`Awards and honors: ${fields.awardsHonors}.`);
  }

  // ── Family section ──
  const familyParts: string[] = [];

  if (fields.spouses) {
    familyParts.push(`Survived by spouse: ${fields.spouses}.`);
  }
  if (fields.children) {
    familyParts.push(`Children: ${fields.children}.`);
  }
  if (fields.grandchildren) {
    familyParts.push(`Grandchildren and great-grandchildren: ${fields.grandchildren}.`);
  }
  if (fields.siblings) {
    familyParts.push(`Siblings: ${fields.siblings}.`);
  }
  if (fields.parents) {
    familyParts.push(`Parents: ${fields.parents}.`);
  }
  if (fields.othersToMention) {
    familyParts.push(`Also remembered by: ${fields.othersToMention}.`);
  }

  if (familyParts.length > 0) {
    lines.push('');
    familyParts.forEach((p) => lines.push(p));
  }

  if (fields.precededInDeath) {
    lines.push(`Preceded in death by: ${fields.precededInDeath}.`);
  }

  // ── Your Voice section ──
  if (fields.quotesToInclude || fields.whatToRemember || fields.personalMessage) {
    lines.push('');
  }

  if (fields.quotesToInclude) {
    lines.push(`"${fields.quotesToInclude}"`);
  }

  if (fields.whatToRemember) {
    lines.push(fields.whatToRemember);
  }

  if (fields.personalMessage) {
    lines.push(fields.personalMessage);
  }

  // ── Final Arrangements ──
  const arrangementParts: string[] = [];

  if (fields.preferredFuneralHome) {
    arrangementParts.push(`Services will be held at ${fields.preferredFuneralHome}.`);
  }
  if (fields.burialOrCremation) {
    arrangementParts.push(fields.burialOrCremation + '.');
  }
  if (fields.servicePreferences) {
    arrangementParts.push(fields.servicePreferences + '.');
  }

  if (arrangementParts.length > 0) {
    lines.push('');
    arrangementParts.forEach((p) => lines.push(p));
  }

  if (fields.charitableDonations) {
    lines.push('');
    lines.push(`In lieu of flowers, donations may be made to: ${fields.charitableDonations}.`);
  }

  return lines.join('\n');
}
