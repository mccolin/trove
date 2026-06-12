import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLists, getList, createList, updateList, deleteList } from "@/services/lists";
import type { List } from "@/types";
import { currentUser } from "@/mock";

export function useLists() {
  return useQuery({
    queryKey: ["lists", currentUser.id],
    queryFn: () => getLists(currentUser.id),
  });
}

export function useList(id: string) {
  return useQuery({
    queryKey: ["lists", id],
    queryFn: () => getList(id),
    enabled: !!id,
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<List, "id" | "createdAt" | "updatedAt">) =>
      createList(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });
}

export function useUpdateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<List, "id" | "createdAt">>;
    }) => updateList(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteList(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });
}
