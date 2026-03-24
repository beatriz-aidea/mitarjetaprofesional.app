
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

  const escapeVCardText = (text: string | undefined) => {
    if (!text) return '';
    return text.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
  };

  const formatUrl = (url: string | undefined) => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVCardText(data.lastName)};${escapeVCardText(data.firstName)};;;`,
    `FN:${escapeVCardText(data.firstName)} ${escapeVCardText(data.lastName)}`,
    data.organization ? `ORG:${escapeVCardText(data.organization)}` : '',
    data.title ? `TITLE:${escapeVCardText(data.title)}` : '',
    data.email ? `EMAIL;TYPE=INTERNET,WORK:${data.email}` : '',
    data.url ? `URL;TYPE=WORK:${formatUrl(data.url)}` : '',
    fullPhoneWork ? `TEL;TYPE=WORK,VOICE:${fullPhoneWork}` : '',
    fullPhoneMobile ? `TEL;TYPE=CELL,VOICE:${fullPhoneMobile}` : '',
    data.street || data.city || data.state || data.zip || data.country ? `ADR;TYPE=WORK:;;${escapeVCardText(data.street)};${escapeVCardText(data.city)};${escapeVCardText(data.state)};${escapeVCardText(data.zip)};${escapeVCardText(data.country)}` : '',
    mapsUrl ? `item1.URL:${mapsUrl}` : '',
    mapsUrl ? `item1.X-ABLabel:Como llegar` : '',
    data.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:${formatUrl(data.linkedin)}` : '',
    data.instagram ? `X-SOCIALPROFILE;TYPE=instagram:${formatUrl(data.instagram)}` : '',
    data.x ? `X-SOCIALPROFILE;TYPE=twitter:${formatUrl(data.x)}` : '',
    data.tiktok ? `X-SOCIALPROFILE;TYPE=tiktok:${formatUrl(data.tiktok)}` : '',
    data.photo ? `PHOTO;ENCODING=b;TYPE=${data.photo.split(';')[0].split('/')[1].toUpperCase()}:${data.photo.split(',')[1]}` : '',
    data.public_id ? `UID:${data.public_id}` : '',
    combinedNotes ? `NOTE:${escapeVCardText(combinedNotes)}` : '',
    'END:VCARD'
  ];

  const foldLine = (line: string) => {
    if (line.length <= 75) return line;
    let folded = '';
    let currentLine = line;
    while (currentLine.length > 75) {
      folded += currentLine.substring(0, 75) + '\r\n ';
      currentLine = currentLine.substring(75);
    }
    folded += currentLine;
    return folded;
  };

  return lines.filter(line => line !== '').map(foldLine).join('\r\n');
};
