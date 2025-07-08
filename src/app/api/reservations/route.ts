
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { addMockReservation, Reservation } from "@/lib/mock-reservations";

import { getMockReservations } from "@/lib/mock-reservations";

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reservations = getMockReservations(session.user.id); // In a real app, you'd filter by userId here
  return NextResponse.json(reservations);
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reservationData: Reservation = await request.json();

    // Basic validation
    if (!reservationData.tripId || !reservationData.price) {
      return NextResponse.json(
        { error: "Missing required reservation data" },
        { status: 400 }
      );
    }

    // Generate a simple reservation ID
    reservationData.reservationId = `RES-${Date.now()}`;
    reservationData.status = "confirmed"; // Mocking immediate confirmation
    reservationData.date = new Date().toISOString();
    reservationData.userId = session.user.id;

    const newReservation = addMockReservation(reservationData);

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error("Error creating mock reservation:", error);
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}
