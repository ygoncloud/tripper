
export interface Reservation {
  reservationId: string;
  tripId: number;
  userId: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  price: number;
}

const mockReservations: Reservation[] = [];

export const addMockReservation = (reservation: Reservation): Reservation => {
  mockReservations.push(reservation);
  return reservation;
};

export const getMockReservations = (): Reservation[] => {
  return mockReservations;
};
