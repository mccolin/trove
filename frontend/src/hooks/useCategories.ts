import { useQuery } from "@tanstack/react-query";
import { getCategoriesForList } from "@/services/categories";

export function useCategories(listId: string) {
  return useQuery({
    queryKey: ["categories", listId],
    queryFn: () => getCategoriesForList(listId),
    enabled: !!listId,
  });
}
