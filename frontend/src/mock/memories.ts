import type { Memory } from "@/types";

export const mockMemories: Memory[] = [
  {
    id: "memory-1",
    listItemId: "item-2",
    rating: 5,
    notes:
      "Everything people say about Zahav is true and then some. The lamb shoulder for two was one of the best things I've ever eaten. The hummus comes out warm and is just ridiculous. Sat at the bar, watched the kitchen. Already thinking about going back.",
    photos: [],
    tags: ["dinner", "special-occasion", "all-time-great"],
    visitedAt: "2025-03-19T19:00:00Z",
    createdAt: "2025-03-20T00:00:00Z",
    updatedAt: "2025-03-20T00:00:00Z",
  },
  {
    id: "memory-2",
    listItemId: "item-13",
    rating: 4,
    notes:
      "LBI exceeded expectations. Rented a house two blocks from the beach in Beach Haven for the weekend. Biked the whole island both days. The lighthouse climb is worth it for the view. Beach Haven itself is low-key and perfect — good pizza, cold beer, no nonsense. Will definitely rent again next summer.",
    photos: [],
    tags: ["beach", "lbi", "weekend", "bikes"],
    visitedAt: "2025-07-26T00:00:00Z",
    createdAt: "2025-07-28T00:00:00Z",
    updatedAt: "2025-07-28T00:00:00Z",
  },
];
