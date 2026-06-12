import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMemoriesForItem, createMemory } from "@/services/memories";
import type { Memory } from "@/types";

export function useMemories(listItemId: string) {
  return useQuery({
    queryKey: ["memories", listItemId],
    queryFn: () => getMemoriesForItem(listItemId),
    enabled: !!listItemId,
  });
}

export function useCreateMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Memory, "id" | "createdAt" | "updatedAt">) =>
      createMemory(data),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["memories", vars.listItemId] }),
  });
}
