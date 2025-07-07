"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { Trip, origins, availableTags } from "@/lib/recommendations";
import { DateRange } from "react-day-picker";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { Toggle } from "@/components/ui/toggle";

type TripRecommendation = Trip & { totalCost: number };

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // Show splash screen for 2 seconds
    return () => clearTimeout(timer);
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();

  const getParam = useCallback((param: string) => searchParams.get(param), [searchParams]);

  const [budget, setBudget] = useState(() => getParam("budget") || "");
  const [origin, setOrigin] = useState(() => getParam("origin") || "");
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const from = getParam("from");
    const to = getParam("to");
    return from && to ? { from: new Date(from), to: new Date(to) } : undefined;
  });
  const [recommendations, setRecommendations] = useState<TripRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState(() => getParam("sort") || "price-asc");
  const [selectedTags, setSelectedTags] = useState<string[]>(() =>
    getParam("tags") ? getParam("tags")!.split(",") : []
  );
  const [userEmail, setUserEmail] = useState<string>("");
  const [numTravelers, setNumTravelers] = useState<number>(() =>
    Number(getParam("travelers")) || 1
  );

  const updateSearchParams = useCallback(
    (params: Record<string, string | undefined>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newSearchParams.set(key, value);
        } else {
          newSearchParams.delete(key);
        }
      });
      router.push(`/?${newSearchParams.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    const numericBudget = Number(budget.replace(/\./g, "")) || 0;
    updateSearchParams({
      budget: numericBudget > 0 ? String(numericBudget) : undefined,
      origin: origin || undefined,
      from: date?.from?.toISOString() || undefined,
      to: date?.to?.toISOString() || undefined,
      tags: selectedTags.length > 0 ? selectedTags.join(",") : undefined,
      travelers: numTravelers > 1 ? String(numTravelers) : undefined,
      sort: sortOption !== "price-asc" ? sortOption : undefined,
    });
  }, [budget, origin, date, selectedTags, numTravelers, sortOption, updateSearchParams]);

  const handleBookNow = async (trip: TripRecommendation) => {
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripId: trip.id,
          userId: "mock-user-123", // Replace with actual user ID from auth context
          price: trip.totalCost,
        }),
      });

      if (response.ok) {
        const reservationResponse = await response.json();
        alert("Reservation successful!");

        const email = prompt("Please enter your email for confirmation:");
        if (!email) {
          alert("Email not provided. Skipping email confirmation.");
          return;
        }

        // Simulate sending email confirmation
        const emailResponse = await fetch("/api/email-confirmation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reservationId: reservationResponse.reservationId,
            userEmail: email,
            tripTitle: trip.title,
          }),
        });

        if (emailResponse.ok) {
          alert("Email confirmation sent!");
        } else {
          const emailErrorData = await emailResponse.json();
          alert(`Email confirmation failed: ${emailErrorData.error}`);
        }
      } else {
        const errorData = await response.json();
        alert(`Reservation failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error booking trip:", error);
      alert("An error occurred while booking the trip.");
    }
  };

  const handleSaveTrip = async (trip: TripRecommendation) => {
    try {
      const response = await fetch("/api/saved-trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripId: trip.id,
          userId: "mock-user-123", // Mock user ID
          title: trip.title,
          description: trip.description,
          totalCost: trip.totalCost,
        }),
      });

      if (response.ok) {
        alert("Trip saved successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to save trip: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error saving trip:", error);
      alert("An error occurred while saving the trip.");
    }
  };

  const handleGetRecommendations = useCallback(async () => {
    if (!origin || !date?.from || !date?.to) {
      // Optionally, show an error message to the user
      return;
    }
    setShowRecommendations(true);
    // Data fetching will now be handled by the useEffect that watches searchParams
  }, [origin, date]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const budgetParam = getParam("budget");
      const originParam = getParam("origin");
      const fromParam = getParam("from");
      const toParam = getParam("to");
      const tagsParam = getParam("tags");
      const travelersParam = getParam("travelers");

      if (!originParam || !fromParam || !toParam) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/recommendations?budget=${budgetParam || 0}&origin=${originParam}&from=${fromParam}&to=${toParam}&tags=${tagsParam || ''}&travelers=${travelersParam || 1}`
        );
        const data = await response.json();
        setRecommendations(data);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    if (showRecommendations) {
      fetchRecommendations();
    }
  }, [searchParams, showRecommendations, getParam]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, "");
    setBudget(numericValue);
  };

  const formattedBudget = () => {
    if (!budget) return "";
    return new Intl.NumberFormat("id-ID").format(Number(budget));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredAndSortedRecommendations = recommendations
    .filter(
      (trip) =>
        selectedTags.length === 0 ||
        selectedTags.every((tag) => trip.tags.includes(tag))
    )
    .sort((a, b) => {
      if (sortOption === "price-asc") {
        return a.totalCost - b.totalCost;
      } else {
        return b.totalCost - a.totalCost;
      }
    });

  return (
    <>
      {showSplash ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <img src="/tripper-icon.svg" alt="Tripper Logo" className="w-24 h-24 text-gray-800 dark:text-gray-200 animate-pulse" />
        </div>
      ) : (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="absolute top-4 right-4 flex space-x-2">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <ModeToggle />
          </div>
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center mb-4">
                <img src="/tripper-home.png" alt="Tripper Home Logo" />
              </div>
              <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-8">
                Enter your budget, origin, and travel dates, and we&apos;ll suggest a
                trip for you.
              </p>
              <div className="max-w-md mx-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="Enter your budget in IDR"
                    className="flex-1"
                    value={formattedBudget()}
                    onChange={handleBudgetChange}
                  />
                  <Input
                    type="number"
                    placeholder="Number of Travelers"
                    className="flex-1"
                    min={1}
                    value={numTravelers}
                    onChange={(e) => setNumTravelers(Number(e.target.value))}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <Select onValueChange={setOrigin} value={origin}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Origin" />
                    </SelectTrigger>
                    <SelectContent>
                      {origins.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DatePickerWithRange date={date} setDate={setDate} />
                <Button
                  onClick={handleGetRecommendations}
                  className="w-full"
                  disabled={!origin || !budget || !date || loading}
                >
                  {loading ? "Getting Recommendations..." : "Get Recommendations"}
                </Button>
              </div>
            </div>
            {showRecommendations && (
              <div className="mt-12">
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">Sort by:</span>
                    <Button
                      variant={sortOption === "price-asc" ? "secondary" : "ghost"}
                      onClick={() => setSortOption("price-asc")}
                    >
                      Price: Low to High
                    </Button>
                    <Button
                      variant={sortOption === "price-desc" ? "secondary" : "ghost"}
                      onClick={() => setSortOption("price-desc")}
                    >
                      Price: High to Low
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">Filter by:</span>
                    {availableTags.map((tag) => (
                      <Toggle
                        key={tag}
                        pressed={selectedTags.includes(tag)}
                        onPressedChange={() => handleTagToggle(tag)}
                        variant="outline"
                      >
                        {tag}
                      </Toggle>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {loading ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  ) : filteredAndSortedRecommendations.length > 0 ? (
                    filteredAndSortedRecommendations.map((trip) => (
                      <Card key={trip.id}>
                        <CardHeader>
                          <CardTitle>{trip.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-500 dark:text-gray-400">
                            {trip.description}
                          </p>
                          <div className="mt-4">
                            <h3 className="font-semibold">
                              Total Cost: {formatRupiah(trip.totalCost)}
                            </h3>
                            <ul className="list-disc list-inside text-gray-500 dark:text-gray-400">
                              <li>
                                Flights from {origin}:{" "}
                                {formatRupiah(trip.breakdown.flights[origin])}
                              </li>
                              <li>
                                Accommodation:{" "}
                                {formatRupiah(trip.breakdown.accommodation)}
                              </li>
                              <li>
                                Activities:{" "}
                                {formatRupiah(trip.breakdown.activities)}
                              </li>
                            </ul>
                          </div>
                          <Button
                            className="mt-4 w-full"
                            onClick={() => handleBookNow(trip)}
                          >
                            Book Now
                          </Button>
                          <Button
                            className="mt-2 w-full"
                            variant="outline"
                            onClick={() => handleSaveTrip(trip)}
                          >
                            Save Trip
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center col-span-full">
                      <h2 className="text-2xl font-bold tracking-tight">
                        No recommendations found
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Try adjusting your budget, origin, or travel dates.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <footer className="absolute bottom-4 text-center w-full">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Made with ❤️ by ygoncloud
            </p>
          </footer>
        </div>
      )}
    </>
  );
}
