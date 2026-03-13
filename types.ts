
export type CardType = 'static' | 'dynamic';

export interface VCardData {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phoneWork: string;
  phoneWorkPrefix: string;
  phoneMobile: string;
  phoneMobilePrefix: string;
  email: string;
  url: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  relationship: string;
  customNote: string;
  observations?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  x?: string;
  photo?: string | null;
  mapsUrl?: string;
  public_id?: string;
}

export interface OrderData {
  quantity: string;
  extraInfo: string;
  fileName: string | null;
}

export interface QRSettings {
  fgColor: string;
  bgColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
  size: number;
}
