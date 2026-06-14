import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMemoriesForItem, createMemory, updateMemory, deleteMemory } from "@/services/memories";
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

export function useDeleteMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; listItemId: string }) => deleteMemory(id),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["memories", vars.listItemId] }),
  });
}

export function useUpdateMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      listItemId: string;
      data: Partial<Omit<Memory, "id" | "createdAt" | "updatedAt">>;
    }) => updateMemory(id, data),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["memories", vars.listItemId] }),
  });
}
