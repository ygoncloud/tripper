
"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedTrip } from "@/lib/mock-saved-trips";
import { Reservation } from "@/lib/mock-reservations";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fetch saved trips
          const savedTripsResponse = await fetch("/api/saved-trips");
          const savedTripsData = await savedTripsResponse.json();
          setSavedTrips(savedTripsData);

          // Fetch reservations
          const reservationsResponse = await fetch("/api/reservations");
          const reservationsData = await reservationsResponse.json();
          setReservations(reservationsData);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading dashboard...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-4xl font-bold mb-8 text-center">Please sign in to view your dashboard</h1>
        <Button onClick={() => signIn()}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center">Your Dashboard</h1>
        <Button onClick={() => signOut()}>Sign Out</Button>
      </div>

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
