
export interface Trip {
  id: number;
  title: string;
  description: string;
  breakdown: {
    flights: { [origin: string]: number };
    accommodation: number; // Price per night
    activities: number;
  };
  tags: string[];
}

export const origins = ["Jakarta", "Surabaya", "Medan"];
export const availableTags = ["Beach", "Culture", "Adventure", "Nature"];



import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const getRecommendations = async (
  budget: number,
  origin: string,
  dateRange: { from: Date; to: Date },
  tags: string[],
  travelers: number
): Promise<(Trip & { totalCost: number })[]> => {
  if (!origin || !dateRange.from || !dateRange.to) {
    return [];
  }

  const { from: fromDate, to: toDate } = dateRange;
  const nights = Math.ceil(
    (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (nights <= 0) return [];

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    I have a budget of ${budget} IDR.
    I want to travel from ${origin} between ${fromDate.toDateString()} and ${toDate.toDateString()} for ${nights} nights, for ${travelers} people.
    Suggest 3-5 travel destinations in Indonesia that fit my budget and preferences.
    ${tags.length > 0 ? `Prioritize destinations with the following tags: ${tags.join(', ')}.` : ''}
    For each destination, provide:
    - id (unique number)
    - title (e.g., "Bali, Indonesia")
    - description (a brief overview)
    - breakdown of estimated costs:
        - flights (from ${origin})
        - accommodation (total for ${nights} nights)
        - activities
    - tags (e.g., "Beach", "Culture", "Adventure", "Nature")

    The output should be a JSON array of objects, strictly adhering to the following TypeScript interface:

    interface Trip {
      id: number;
      title: string;
      description: string;
      breakdown: {
        flights: { [origin: string]: number };
        accommodation: number;
        activities: number;
      };
      tags: string[];
    }

    Ensure the 'flights' object in the breakdown has a key for '${origin}' with the estimated flight cost.
    Calculate the totalCost for each trip based on the breakdown.
    Only include trips where the totalCost is less than or equal to the budget.
    Example of expected JSON output:
    [
      {
        "id": 1,
        "title": "Bali, Indonesia",
        "description": "A tropical paradise with beautiful beaches and lush jungles.",
        "breakdown": {
          "flights": {
            "Jakarta": 1500000
          },
          "accommodation": 2000000,
          "activities": 2000000
        },
        "tags": ["Beach", "Culture", "Adventure"]
      }
    ]
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Attempt to parse the JSON, handling potential markdown formatting
    let parsedRecommendations: Trip[];
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch || !jsonMatch[1]) {
        throw new Error("No JSON content found within markdown block.");
      }
      parsedRecommendations = JSON.parse(jsonMatch[1]);
    } catch (jsonError) {
      console.error("Failed to parse JSON from Gemini API:", text);
      throw new Error("Invalid JSON response from Gemini API.");
    }

    const recommendedTripsWithCost = parsedRecommendations
      .map((trip) => {
        const totalCost =
          (trip.breakdown.flights[origin] || 0) +
          trip.breakdown.accommodation +
          trip.breakdown.activities;
        return { ...trip, totalCost };
      })
      .filter((trip) => trip.totalCost <= budget);

    return recommendedTripsWithCost;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return [];
  }
};
