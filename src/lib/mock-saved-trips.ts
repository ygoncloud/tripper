
export interface SavedTrip {
  id: string;
  tripId: number;
  userId: string;
  title: string;
  description: string;
  totalCost: number;
  savedAt: string;
}

const mockSavedTrips: SavedTrip[] = [];

export const addMockSavedTrip = (trip: SavedTrip): SavedTrip => {
  mockSavedTrips.push(trip);
  return trip;
};

export const getMockSavedTrips = (userId: string): SavedTrip[] => {
  return mockSavedTrips.filter(savedTrip => savedTrip.userId === userId);
};
