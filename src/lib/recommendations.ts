
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

const trips: Trip[] = [
  {
    id: 1,
    title: "Bali, Indonesia",
    description: "A tropical paradise with beautiful beaches and lush jungles.",
    breakdown: {
      flights: { Jakarta: 1500000, Surabaya: 1000000, Medan: 2500000 },
      accommodation: 500000, // Per night
      activities: 2000000,
    },
    tags: ["Beach", "Culture", "Adventure"],
  },
  {
    id: 2,
    title: "Yogyakarta, Indonesia",
    description: "A cultural hub with ancient temples and vibrant street art.",
    breakdown: {
      flights: { Jakarta: 800000, Surabaya: 600000, Medan: 2000000 },
      accommodation: 300000, // Per night
      activities: 1500000,
    },
    tags: ["Culture"],
  },
  {
    id: 3,
    title: "Lombok, Indonesia",
    description: "A serene island with stunning beaches and a majestic volcano.",
    breakdown: {
      flights: { Jakarta: 1800000, Surabaya: 1200000, Medan: 2800000 },
      accommodation: 600000, // Per night
      activities: 2000000,
    },
    tags: ["Beach", "Nature"],
  },
  {
    id: 4,
    title: "Raja Ampat, Indonesia",
    description: "A remote archipelago with world-class diving and pristine nature.",
    breakdown: {
      flights: { Jakarta: 4000000, Surabaya: 4500000, Medan: 6000000 },
      accommodation: 1000000, // Per night
      activities: 3000000,
    },
    tags: ["Adventure", "Nature", "Beach"],
  },
  {
    id: 5,
    title: "Komodo Island, Indonesia",
    description: "Home to the famous Komodo dragons and stunning pink beaches.",
    breakdown: {
      flights: { Jakarta: 3000000, Surabaya: 2500000, Medan: 4500000 },
      accommodation: 800000, // Per night
      activities: 3000000,
    },
    tags: ["Adventure", "Nature"],
  },
];

export const getRecommendations = (
  budget: number,
  origin: string,
  dateRange: { from: Date; to: Date }
): (Trip & { totalCost: number })[] => {
  if (!origin || !dateRange.from || !dateRange.to) {
    return [];
  }

  const { from: fromDate, to: toDate } = dateRange;
  const day = fromDate.getDay();
  const month = fromDate.getMonth();

  const nights = Math.ceil(
    (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (nights <= 0) return [];

  // Weekend surcharge (Friday, Saturday, Sunday)
  const isWeekend = day === 5 || day === 6 || day === 0;
  const weekendSurcharge = isWeekend ? 1.2 : 1;

  // Peak season surcharge (June, July, December)
  const isPeakSeason = month === 5 || month === 6 || month === 11;
  const peakSeasonSurcharge = isPeakSeason ? 1.5 : 1;

  const recommendedTrips = trips
    .map((trip) => {
      const flightCost = trip.breakdown.flights[origin] || Infinity;
      const accommodationCostPerNight = trip.breakdown.accommodation;

      const adjustedFlightCost = flightCost * weekendSurcharge * peakSeasonSurcharge;
      const totalAccommodationCost =
        accommodationCostPerNight * nights * weekendSurcharge * peakSeasonSurcharge;

      const totalCost =
        adjustedFlightCost +
        totalAccommodationCost +
        trip.breakdown.activities;

      return {
        ...trip,
        totalCost,
        breakdown: {
          ...trip.breakdown,
          accommodation: totalAccommodationCost, // Show total accommodation cost
        },
      };
    })
    .filter((trip) => trip.totalCost <= budget);

  return recommendedTrips;
};
