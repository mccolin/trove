import type { Event } from "@/types";

export const mockEvents: Event[] = [
  {
    id: "event-1",
    name: "Philadelphia Phillies 2026 Season",
    description:
      "The Phillies are looking to make another deep postseason run. Get out to Citizens Bank Park before the summer crowds peak.",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800",
    websiteUrl: "https://mlb.com/phillies",
    category: "Sports",
    startDate: "2026-03-26",
    endDate: "2026-09-27",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "event-2",
    name: "Made in America Festival",
    description:
      "Jay-Z's annual Labor Day weekend music festival on the Benjamin Franklin Parkway. Two days, multiple stages, right in the heart of the city.",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    websiteUrl: "https://madeinamericafest.com",
    category: "Concert",
    startDate: "2026-08-29",
    endDate: "2026-08-30",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "event-3",
    name: "Stone Pony Summer Stage",
    description:
      "The legendary Asbury Park venue runs outdoor concerts on their Summer Stage all season. Always a great mix of national acts and Jersey originals.",
    imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
    websiteUrl: "https://stoneponyonline.com",
    category: "Concert",
    startDate: "2026-05-01",
    endDate: "2026-09-30",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
];
