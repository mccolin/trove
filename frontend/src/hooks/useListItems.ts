import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getListItems,
  getListItem,
  createListItem,
  updateListItem,
  deleteListItem,
  resolveTarget,
} from "@/services/listItems";
import type { ListItem } from "@/types";

export function useListItems(listId: string) {
  return useQuery({
    queryKey: ["listItems", listId],
    queryFn: () => getListItems(listId),
    enabled: !!listId,
  });
}

export function useListItem(id: string) {
  return useQuery({
    queryKey: ["listItem", id],
    queryFn: () => getListItem(id),
    enabled: !!id,
  });
}

export function useListItemWithTarget(id: string) {
  return useQuery({
    queryKey: ["listItem", id, "withTarget"],
    queryFn: async () => {
      const item = await getListItem(id);
      if (!item) return undefined;
      return { ...item, target: resolveTarget(item) };
    },
    enabled: !!id,
  });
}

export function useCreateListItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ListItem, "id" | "createdAt" | "updatedAt">) =>
      createListItem(data),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["listItems", vars.listId] }),
  });
}

export function useUpdateListItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<ListItem, "id" | "createdAt">>;
    }) => updateListItem(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listItems"] }),
  });
}

export function useDeleteListItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, listId: _listId }: { id: string; listId: string }) =>
      deleteListItem(id),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["listItems", vars.listId] }),
  });
}
