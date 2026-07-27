export interface GoogleOpeningDate {
  year?: number;
  month?: number;
  day?: number;
}

export interface GooglePlace {
  id: string;

  displayName?: {
    text: string;
    languageCode?: string;
  };

  formattedAddress?: string;
  primaryType?: string;
  businessStatus?: string;
  openingDate?: GoogleOpeningDate;
  googleMapsUri?: string;
}