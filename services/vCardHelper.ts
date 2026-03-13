
import { VCardData } from '../types';

/**
 * Generates a standard vCard 3.0 string.
 * Appends relationship, custom notes, and a Google Maps link to the NOTE field for context.
 */
export const generateVCardString = (data: VCardData): string => {
  const relationshipContext = data.relationship ? `Conocido por: ${data.relationship}` : '';
  const userNoteContext = data.customNote ? `Recuérdame: ${data.customNote}` : '';
  
  const combinedNotes = [
    relationshipContext,
    userNoteContext,
  ].filter(Boolean).join(' | ');

  const fullPhoneWork = data.phoneWork ? `${data.phoneWorkPrefix}${data.phoneWork.replace(/\s+/g, '')}` : '';
  const fullPhoneMobile = data.phoneMobile ? `${data.phoneMobilePrefix}${data.phoneMobile.replace(/\s+/g, '')}` : '';

  const addressParts = [data.street, data.city, data.state, data.zip, data.country].filter(Boolean);
  const addressString = addressParts.join(', ');
  const mapsUrl = addressString ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}` : '';

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${data.lastName};${data.firstName};;;`,
    `FN:${data.firstName} ${data.lastName}`,
    data.organization ? `ORG:${data.organization}` : '',
    data.title ? `TITLE:${data.title}` : '',
    data.email ? `EMAIL;TYPE=INTERNET,WORK:${data.email}` : '',
    data.url ? `URL;TYPE=WORK:${data.url}` : '',
    fullPhoneWork ? `TEL;TYPE=WORK,VOICE:${fullPhoneWork}` : '',
    fullPhoneMobile ? `TEL;TYPE=CELL,VOICE:${fullPhoneMobile}` : '',
    data.street || data.city || data.state || data.zip || data.country ? `ADR;TYPE=WORK:;;${data.street || ''};${data.city || ''};${data.state || ''};${data.zip || ''};${data.country || ''}` : '',
    mapsUrl ? `item1.URL:${mapsUrl}` : '',
    mapsUrl ? `item1.X-ABLabel:Como llegar` : '',
    data.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:${data.linkedin}` : '',
    data.instagram ? `X-SOCIALPROFILE;TYPE=instagram:${data.instagram}` : '',
    data.x ? `X-SOCIALPROFILE;TYPE=twitter:${data.x}` : '',
    data.tiktok ? `X-SOCIALPROFILE;TYPE=tiktok:${data.tiktok}` : '',
    data.photo ? `PHOTO;ENCODING=b;TYPE=JPEG:${data.photo.split(',')[1]}` : '',
    data.public_id ? `UID:${data.public_id}` : '',
    combinedNotes ? `NOTE:${combinedNotes.replace(/\n/g, '\\n')}` : '',
    'END:VCARD'
  ];

  return lines.filter(line => line !== '').join('\n');
};
