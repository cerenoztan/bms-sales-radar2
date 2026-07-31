
export interface GooglePlace {
  id: string;

  displayName?: {
    text: string;
    languageCode?: string;
  };

  formattedAddress?:string;
  googleMapsUri?: string;
}

export interface DistrictPlaceResult {
  district: string;
  places: GooglePlace[];
  success: boolean;
  error?: unknown;
}