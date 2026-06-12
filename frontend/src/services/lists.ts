import type { List } from "@/types";
import { mockLists } from "@/mock";

let lists = [...mockLists];

export async function getLists(userId: string): Promise<List[]> {
  await delay();
  return lists.filter(
    (l) => l.ownerId === userId || l.memberIds.includes(userId)
  );
}

export async function getList(id: string): Promise<List | undefined> {
  await delay();
  return lists.find((l) => l.id === id);
}

export async function createList(
  data: Omit<List, "id" | "createdAt" | "updatedAt">
): Promise<List> {
  await delay();
  const list: List = {
    ...data,
    id: `list-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  lists = [...lists, list];
  return list;
}

export async function updateList(
  id: string,
  data: Partial<Omit<List, "id" | "createdAt">>
): Promise<List> {
  await delay();
  lists = lists.map((l) =>
    l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l
  );
  return lists.find((l) => l.id === id)!;
}

export async function deleteList(id: string): Promise<void> {
  await delay();
  lists = lists.filter((l) => l.id !== id);
}

function delay(ms = 150) {
  return new Promise((res) => setTimeout(res, ms));
}
