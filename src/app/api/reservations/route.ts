
import { NextResponse } from "next/server";
import { addMockReservation, Reservation } from "@/lib/mock-reservations";

import { getMockReservations } from "@/lib/mock-reservations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  const reservations = getMockReservations(); // In a real app, you'd filter by userId here
  return NextResponse.json(reservations);
}

export async function POST(request: Request) {
  try {
    const reservationData: Reservation = await request.json();

    // Basic validation
    if (!reservationData.tripId || !reservationData.userId || !reservationData.price) {
      return NextResponse.json(
        { error: "Missing required reservation data" },
        { status: 400 }
      );
    }

    // Generate a simple reservation ID
    reservationData.reservationId = `RES-${Date.now()}`;
    reservationData.status = "confirmed"; // Mocking immediate confirmation
    reservationData.date = new Date().toISOString();

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
