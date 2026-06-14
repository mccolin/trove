import type { Memory } from "@/types";
import { mockMemories } from "@/mock";

let memories = [...mockMemories];

export async function getMemoriesForItem(listItemId: string): Promise<Memory[]> {
  await delay();
  return memories.filter((m) => m.listItemId === listItemId);
}

export async function createMemory(
  data: Omit<Memory, "id" | "createdAt" | "updatedAt">
): Promise<Memory> {
  await delay();
  const memory: Memory = {
    ...data,
    id: `memory-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memories = [...memories, memory];
  return memory;
}

export async function updateMemory(
  id: string,
  data: Partial<Omit<Memory, "id" | "createdAt" | "updatedAt">>
): Promise<Memory> {
  await delay();
  const index = memories.findIndex((m) => m.id === id);
  if (index === -1) throw new Error("Memory not found");
  const updated: Memory = {
    ...memories[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  memories = memories.map((m) => (m.id === id ? updated : m));
  return updated;
}

export async function deleteMemory(id: string): Promise<void> {
  await delay();
  memories = memories.filter((m) => m.id !== id);
}

function delay(ms = 150) {
  return new Promise((res) => setTimeout(res, ms));
}
