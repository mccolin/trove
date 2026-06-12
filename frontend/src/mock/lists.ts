import type { List } from "@/types";

export const mockLists: List[] = [
  {
    id: "list-1",
    name: "Philly Summer",
    description: "Things to eat, see, and do in and around the city.",
    coverImageUrl: "https://images.unsplash.com/photo-1517009572053-93fb56dfef49?q=80&w=2204&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800",
    ownerId: "user-1",
    memberIds: ["user-1", "user-2"],
    tags: ["philly", "food", "culture"],
    mapCenter: { lat: 39.952, lng: -75.165 },
    defaultZoom: 13,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "list-2",
    name: "Down the Shore",
    description: "Beach towns, boardwalks, and summer spots along the Jersey Shore.",
    coverImageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    ownerId: "user-1",
    memberIds: ["user-1", "user-2", "user-3"],
    tags: ["shore", "beach", "summer"],
    mapCenter: { lat: 39.6, lng: -74.25 },
    defaultZoom: 8,
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-06-10T00:00:00Z",
  },
];
