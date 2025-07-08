
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { addMockSavedTrip, getMockSavedTrips, SavedTrip } from "@/lib/mock-saved-trips";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const savedTripData: SavedTrip = await request.json();

    if (!savedTripData.tripId || !savedTripData.title) {
      return NextResponse.json(
        { error: "Missing required saved trip data" },
        { status: 400 }
      );
    }

    savedTripData.id = `SAVED-${Date.now()}`;
    savedTripData.savedAt = new Date().toISOString();
    savedTripData.userId = session.user.id;

    const newSavedTrip = addMockSavedTrip(savedTripData);

    return NextResponse.json(newSavedTrip, { status: 201 });
  } catch (error) {
    console.error("Error creating mock saved trip:", error);
    return NextResponse.json(
      { error: "Failed to save trip" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const savedTrips = getMockSavedTrips(session.user.id);
  return NextResponse.json(savedTrips);
}
