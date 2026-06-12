// Global / Shared Models

export interface Place {
  id: string;
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  imageUrl?: string;
  websiteUrl?: string;
  externalIds?: {
    mapboxId?: string;
    googlePlaceId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  websiteUrl?: string;
  category: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Occurrence {
  id: string;
  eventId: string;
  placeId: string;
  date: string;
  time?: string;
  durationMinutes?: number;
  name?: string;
  description?: string;
  ticketUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// User / List-Scoped Models

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface List {
  id: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  ownerId: string;
  memberIds: string[];
  tags: string[];
  mapCenter: { lat: number; lng: number };
  defaultZoom: number;
  createdAt: string;
  updatedAt: string;
}

export type ListItemTargetType = "place" | "event" | "occurrence";
export type ListItemPriority = "low" | "medium" | "high";
export type ListItemStatus = "wanted" | "planned" | "done";

export interface ListItem {
  id: string;
  listId: string;
  targetType: ListItemTargetType;
  targetId: string;
  notes?: string;
  priority: ListItemPriority;
  status: ListItemStatus;
  categoryId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  listId: string;
  name: string;
  color: string;
}

export interface Plan {
  id: string;
  listItemId: string;
  date: string;
  time?: string;
  durationMinutes?: number;
  attendeeIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Memory {
  id: string;
  listItemId: string;
  planId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  photos: string[];
  tags: string[];
  visitedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Enriched / Derived Types (used in UI)

export interface ListItemWithTarget extends ListItem {
  target: Place | Event | Occurrence;
}
