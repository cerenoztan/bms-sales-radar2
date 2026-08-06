
export interface GooglePlace {
  id: string;

  displayName?: {
    text: string;
    languageCode?: string;
  };

  formattedAddress?:string;
  nationalPhoneNumber?: string;
  googleMapsUri?: string;
}

export interface DistrictPlaceResult {
  district: string;
  places: GooglePlace[];
  success: boolean;
  error?: unknown;
}

export interface ResolvedBusinessMatch {
  placeId: string;
  name: string;
  address?: string;
  googleMapsUrl?: string;
  phone?: string;
}
