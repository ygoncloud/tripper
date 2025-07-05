
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedTrip } from "@/lib/mock-saved-trips";
import { Reservation } from "@/lib/mock-reservations";

export default function DashboardPage() {
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user ID - in a real app, this would come from authentication
  const userId = "mock-user-123";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch saved trips
        const savedTripsResponse = await fetch(`/api/saved-trips?userId=${userId}`);
        const savedTripsData = await savedTripsResponse.json();
        setSavedTrips(savedTripsData);

        // Fetch reservations
        const reservationsResponse = await fetch(`/api/reservations?userId=${userId}`);
        const reservationsData = await reservationsResponse.json();
        setReservations(reservationsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Dashboard</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Saved Trips</h2>
        {savedTrips.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No saved trips yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTrips.map((trip) => (
              <Card key={trip.id}>
                <CardHeader>
                  <CardTitle>{trip.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">{trip.description}</p>
                  <p className="font-semibold">Cost: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(trip.totalCost)}</p>
                  <p className="text-sm text-gray-400">Saved on: {new Date(trip.savedAt).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Past Reservations</h2>
        {reservations.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No past reservations yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((reservation) => (
              <Card key={reservation.reservationId}>
                <CardHeader>
                  <CardTitle>Reservation ID: {reservation.reservationId}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">Trip ID: {reservation.tripId}</p>
                  <p className="font-semibold">Price: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(reservation.price)}</p>
                  <p className="text-sm text-gray-400">Status: {reservation.status}</p>
                  <p className="text-sm text-gray-400">Booked on: {new Date(reservation.date).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
