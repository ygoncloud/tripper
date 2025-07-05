"use client";

import { useState } from "react";
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
  const [budget, setBudget] = useState("");
  const [origin, setOrigin] = useState("");
  const [date, setDate] = useState<DateRange | undefined>();
  const [recommendations, setRecommendations] = useState<TripRecommendation[]>(
    []
  );
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState("price-asc");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleGetRecommendations = async () => {
    if (!origin || !date?.from || !date?.to) {
      // Optionally, show an error message to the user
      return;
    }
    setLoading(true);
    setShowRecommendations(true);
    const numericBudget = Number(budget.replace(/\./g, "")) || 0;
    const response = await fetch(
      `/api/recommendations?budget=${numericBudget}&origin=${origin}&from=${date.from.toISOString()}&to=${date.to.toISOString()}`
    );
    const data = await response.json();
    setRecommendations(data);
    setLoading(false);
  };

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
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
            Trip Planner
          </h1>
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
            <div className="flex justify-center items-center space-x-4 mb-8">
              <div className="flex items-center space-x-2">
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
              <div className="flex items-center space-x-2">
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
    </div>
  );
}