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

function delay(ms = 150) {
  return new Promise((res) => setTimeout(res, ms));
}
