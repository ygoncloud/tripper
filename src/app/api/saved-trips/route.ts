
import { NextResponse } from "next/server";
import { addMockSavedTrip, getMockSavedTrips, SavedTrip } from "@/lib/mock-saved-trips";

export async function POST(request: Request) {
  try {
    const savedTripData: SavedTrip = await request.json();

    if (!savedTripData.tripId || !savedTripData.userId || !savedTripData.title) {
      return NextResponse.json(
        { error: "Missing required saved trip data" },
        { status: 400 }
      );
    }

    savedTripData.id = `SAVED-${Date.now()}`;
    savedTripData.savedAt = new Date().toISOString();

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
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  const savedTrips = getMockSavedTrips(userId);
  return NextResponse.json(savedTrips);
}
