
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { reservationId, userEmail, tripTitle } = await request.json();

    // Simulate sending an email
    console.log(`
      --- Mock Email Confirmation ---
      To: ${userEmail}
      Subject: Your Trip Reservation Confirmation for ${tripTitle}

      Dear customer,

      Your reservation (ID: ${reservationId}) for ${tripTitle} has been successfully confirmed.
      You will receive further details shortly.

      <h1>Thank you for booking with tanaya!</h1>
      -------------------------------
    `);

    return NextResponse.json({ message: "Email confirmation simulated successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Error simulating email confirmation:", error);
    return NextResponse.json(
      { error: "Failed to simulate email confirmation" },
      { status: 500 }
    );
  }
}
