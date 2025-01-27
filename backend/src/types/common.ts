export interface BaseDocument {
  createdAt: Date;
  updatedAt: Date;
}

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  street?: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates?: GeoLocation;
}

export interface TimeRange {
  startTime: Date;
  endTime?: Date;
}
