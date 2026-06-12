import type { ListItem, Place, Event, Occurrence } from "@/types";
import {
  mockListItems,
  mockPlaces,
  mockEvents,
  mockOccurrences,
} from "@/mock";

let items = [...mockListItems];

export async function getListItems(listId: string): Promise<ListItem[]> {
  await delay();
  return items.filter((i) => i.listId === listId);
}

export async function getListItem(id: string): Promise<ListItem | undefined> {
  await delay();
  return items.find((i) => i.id === id);
}

export function resolveTarget(
  item: ListItem
): Place | Event | Occurrence | undefined {
  if (item.targetType === "place")
    return mockPlaces.find((p) => p.id === item.targetId);
  if (item.targetType === "event")
    return mockEvents.find((e) => e.id === item.targetId);
  if (item.targetType === "occurrence")
    return mockOccurrences.find((o) => o.id === item.targetId);
}

export async function createListItem(
  data: Omit<ListItem, "id" | "createdAt" | "updatedAt">
): Promise<ListItem> {
  await delay();
  const item: ListItem = {
    ...data,
    id: `item-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items = [...items, item];
  return item;
}

export async function updateListItem(
  id: string,
  data: Partial<Omit<ListItem, "id" | "createdAt">>
): Promise<ListItem> {
  await delay();
  items = items.map((i) =>
    i.id === id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i
  );
  return items.find((i) => i.id === id)!;
}

export async function deleteListItem(id: string): Promise<void> {
  await delay();
  items = items.filter((i) => i.id !== id);
}

function delay(ms = 150) {
  return new Promise((res) => setTimeout(res, ms));
}
